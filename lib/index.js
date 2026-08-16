/**
 * captain-call（队长来电）— host plane.
 *
 * 职责：
 * 1. 读取每个工作区 <stateDir>/<team>/team.json（AgentTeams 磁盘真相），
 *    把"成员 / 任务 / 状态 / 时间戳"整理成 JSON；
 * 2. 把解析后的配置与状态一起通过 /plugins/dsh-captain-call/state 提供给浏览器客户端轮询；
 * 3. 通过 /plugins/dsh-captain-call/assets 提供头像素材（白名单，防目录穿越）；
 * 4. 语音桥：POST /plugins/dsh-captain-call/chat 把队长语音转文字投递给真实成员 agent
 *    （ctx.subagents.followup），GET /plugins/dsh-captain-call/replies 从队长邮箱
 *    inbox/captain.jsonl 拉取该成员的简短回复，客户端 TTS 播报，实现实时语音办公对话。
 *
 * @module dsh-captain-call
 */
import z from '@deepseek-ai/schemastery';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BlockAssembler } from '@deepseek-ai/dsh-llm';

export const name = 'captain-call';
export const inject = ['agents', 'subagents', 'llm'];

export const Config = z.object({
    stateDir: z.string().default('.agent-teams'),
    bossName: z.string().default('Daisy'),
    bossTitle: z.string().default('队长'),
    autoAnswerMs: z.natural().default(3500),
    pollMs: z.natural().default(4000),
    speechRate: z.number().default(1.0),
    fastChat: z.boolean().default(true),
    fastMaxTokens: z.natural().default(200),
    greeting: z.string().default('{bossName}{bossTitle}你好！我是{member}。向你汇报：任务《{subject}》已完成。{timing}请验收。'),
    timingOk: z.string().default('按要求准时完成，用时约 {minutes} 分钟。'),
    timingFailed: z.string().default('很抱歉，任务没有按要求完成，当前状态是 {status}。'),
    ringText: z.string().default('{member} 来电…'),
    bossAvatar: z.string().default('ginka.png'),
    fallbackAvatar: z.string().default('placeholder.svg'),
    avatarMapJson: z.string().default('{"制导方案研究员":"hachiman.png","开源复现工程师":"oreki.png","机载视觉可行性研究员":"chengxiaoshi.png","学习计划整理师":"luguang.png"}'),
    ttsEngine: z.string().default('auto'),
    voiceMapJson: z.string().default('{"ginka":"zf_001","制导方案研究员":"zm_009","开源复现工程师":"zm_011","机载视觉可行性研究员":"zm_010","学习计划整理师":"zm_013","default":"zf_001"}'),
    voiceMapEdgeJson: z.string().default('{"ginka":"zh-CN-XiaoxiaoNeural","default":"zh-CN-YunxiNeural"}'),
});

/** Web-server service key candidates, newest first. */
const WEB_SERVER_KEYS = ['webServer', 'httpServer'];
/** Workspace registry service key candidates, newest first. */
const WORKSPACE_KEYS = ['workspaceRegistry', 'workspace'];

const DEFAULTS = {
    stateDir: '.agent-teams',
    bossName: 'Daisy',
    bossTitle: '队长',
    autoAnswerMs: 3500,
    pollMs: 4000,
    speechRate: 1.0,
    fastChat: true,
    fastMaxTokens: 200,
    greeting: '{bossName}{bossTitle}你好！我是{member}。向你汇报：任务《{subject}》已完成。{timing}请验收。',
    timingOk: '按要求准时完成，用时约 {minutes} 分钟。',
    timingFailed: '很抱歉，任务没有按要求完成，当前状态是 {status}。',
    ringText: '{member} 来电…',
    bossAvatar: 'ginka.png',
    fallbackAvatar: 'placeholder.svg',
    avatarMapJson: '{"制导方案研究员":"hachiman.png","开源复现工程师":"oreki.png","机载视觉可行性研究员":"chengxiaoshi.png","学习计划整理师":"luguang.png"}',
    ttsEngine: 'auto',
    voiceMapJson: '{"ginka":"zf_001","制导方案研究员":"zm_009","开源复现工程师":"zm_011","机载视觉可行性研究员":"zm_010","学习计划整理师":"zm_013","default":"zf_001"}',
    voiceMapEdgeJson: '{"ginka":"zh-CN-XiaoxiaoNeural","default":"zh-CN-YunxiNeural"}',
};

function resolveConfig(raw) {
    const cfg = { ...DEFAULTS };
    for (const key of Object.keys(DEFAULTS)) {
        if (raw?.[key] !== undefined && raw[key] !== null) cfg[key] = raw[key];
    }
    try {
        cfg.avatarMap = typeof cfg.avatarMapJson === 'string' ? JSON.parse(cfg.avatarMapJson) : {};
    } catch {
        cfg.avatarMap = {};
    }
    try {
        cfg.voiceMap = typeof cfg.voiceMapJson === 'string' ? JSON.parse(cfg.voiceMapJson) : {};
    } catch {
        cfg.voiceMap = {};
    }
    try {
        cfg.voiceMapEdge = typeof cfg.voiceMapEdgeJson === 'string' ? JSON.parse(cfg.voiceMapEdgeJson) : {};
    } catch {
        cfg.voiceMapEdge = {};
    }
    return cfg;
}

/**
 * Read AgentTeams on-disk state for every workspace.
 */
async function collectTeams(workspaceRegistry, stateDir) {
    const teams = [];
    const roots = workspaceRegistry.list().map((workspace) => ({
        workspace: workspace.title,
        path: workspace.path,
    }));
    for (const root of roots) {
        let entries = [];
        try {
            entries = await readdir(join(root.path, stateDir), { withFileTypes: true });
        } catch {
            continue;
        }
        for (const entry of entries) {
            if (!entry.isDirectory() || entry.name === 'archive') continue;
            try {
                const raw = await readFile(join(root.path, stateDir, entry.name, 'team.json'), 'utf8');
                const team = JSON.parse(raw);
                teams.push({
                    workspace: root.workspace,
                    team: entry.name,
                    name: team.name ?? entry.name,
                    captainSessionId: team.captainSessionId,
                    members: (team.members ?? []).map((m) => ({
                        name: m.name,
                        role: m.role,
                        status: m.status,
                    })),
                    tasks: (team.tasks ?? []).map((t) => ({
                        id: t.id,
                        subject: t.subject,
                        status: t.status,
                        assignee: t.assignee,
                        createdAt: t.createdAt,
                        updatedAt: t.updatedAt,
                        output: typeof t.output === 'string' ? t.output.slice(0, 400) : '',
                    })),
                });
            } catch {
                continue;
            }
        }
    }
    return teams;
}

/** Locate a team record on disk by workspace title + team dir name. */
async function readTeamRecord(workspaceRegistry, stateDir, workspaceTitle, teamDir) {
    const root = workspaceRegistry.list().find((w) => w.title === workspaceTitle);
    if (!root) return null;
    try {
        const raw = await readFile(join(root.path, stateDir, teamDir, 'team.json'), 'utf8');
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

const ASSET_ALLOWLIST = new Set([
    'ginka.png',
    'hachiman.png',
    'oreki.png',
    'chengxiaoshi.png',
    'luguang.png',
    'placeholder.svg',
    'ringtone.m4a',
]);

/* ---------- 语音引擎：Kokoro-82M-zh（开源本地 ONNX，主）→ msedge-tts（兜底） ---------- */
const ttsState = { engine: 'loading', ready: false, initError: null, kokoro: null };
let transformersMod = null;
let edgeMod = null;
async function loadTransformers() {
    if (!transformersMod) transformersMod = await import('@huggingface/transformers');
    return transformersMod;
}
async function loadEdgeTts() {
    if (!edgeMod) edgeMod = await import('msedge-tts');
    return edgeMod;
}
async function initKokoro(logger) {
    try {
        const { AutoModel, AutoTokenizer, env } = await loadTransformers();
        env.allowLocalModels = true;
        env.useBrowserCache = false;
        const modelDir = fileURLToPath(new URL('../models/kokoro-zh/', import.meta.url));
        const model = await AutoModel.from_pretrained(modelDir, { dtype: 'q8', device: 'cpu' });
        const tokenizer = await AutoTokenizer.from_pretrained(modelDir);
        ttsState.kokoro = { model, tokenizer };
        ttsState.ready = true;
        ttsState.engine = 'kokoro';
        logger?.info('captain-call: kokoro-82M-zh TTS ready (local ONNX, offline)');
    } catch (error) {
        ttsState.initError = String(error);
        ttsState.engine = 'edge';
        logger?.warn(`captain-call: kokoro init failed (${String(error)}); using msedge-tts fallback`);
    }
}
/** Kokoro 直连 ONNX：input_ids + style[1,256] + speed → 24kHz 波形（无需声码器） */
async function kokoroSynthesize(text, voiceFile) {
    const { Tensor } = await loadTransformers();
    const { model, tokenizer } = ttsState.kokoro;
    const { input_ids } = tokenizer(text, { truncation: true });
    const voiceBuf = await readFile(voiceFile);
    const embAll = new Float32Array(voiceBuf.buffer, voiceBuf.byteOffset, voiceBuf.byteLength / 4);
    const offset = 256 * Math.min(Math.max(input_ids.dims.at(-1) - 2, 0), 509);
    const style = embAll.slice(offset, offset + 256);
    const { waveform } = await model({
        input_ids,
        style: new Tensor('float32', style, [1, 256]),
        speed: new Tensor('float32', [1.0], [1]),
    });
    return { audio: waveform.data, sampling_rate: 24000 };
}
/** 16-bit PCM WAV 编码（Kokoro 输出 float32 波形） */
function encodeWav(float32, sampleRate) {
    const buffer = Buffer.alloc(44 + float32.length * 2);
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + float32.length * 2, 4);
    buffer.write('WAVE', 8);
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16);
    buffer.writeUInt16LE(1, 20);
    buffer.writeUInt16LE(1, 22);
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(sampleRate * 2, 28);
    buffer.writeUInt16LE(2, 32);
    buffer.writeUInt16LE(16, 34);
    buffer.write('data', 36);
    buffer.writeUInt32LE(float32.length * 2, 40);
    for (let i = 0; i < float32.length; i++) {
        const sample = Math.max(-1, Math.min(1, float32[i]));
        buffer.writeInt16LE(sample < 0 ? sample * 0x8000 : sample * 0x7fff, 44 + i * 2);
    }
    return buffer;
}
async function edgeSynthesize(text, voice) {
    const { MsEdgeTTS, OUTPUT_FORMAT } = await loadEdgeTts();
    const tts = new MsEdgeTTS();
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    const { audioStream } = tts.toStream(text);
    const chunks = [];
    for await (const chunk of audioStream) chunks.push(Buffer.from(chunk));
    return Buffer.concat(chunks);
}

/* Edge 微软神经音色目录（含风格标注） */
const EDGE_VOICES = [
    { id: 'zh-CN-XiaoxiaoNeural', gender: '女声', style: '晓晓·温柔亲切（默认女声）' },
    { id: 'zh-CN-XiaoyiNeural', gender: '女声', style: '晓伊·活泼可爱' },
    { id: 'zh-CN-YunxiNeural', gender: '男声', style: '云希·阳光青年（默认男声）' },
    { id: 'zh-CN-YunjianNeural', gender: '男声', style: '云健·沉稳有力（解说风）' },
    { id: 'zh-CN-YunyangNeural', gender: '男声', style: '云扬·专业播报（新闻风）' },
];

/* Kokoro 本地音色目录缓存（60 秒刷新一次）；风格标注支持 scripts/voice-traits.json 扩展 */
let kokoroVoiceCache = { at: 0, list: [] };
let kokoroTraitsCache = { at: 0, traits: {} };
async function loadKokoroTraits() {
    if (Date.now() - kokoroTraitsCache.at < 300_000) return kokoroTraitsCache.traits;
    try {
        const p = fileURLToPath(new URL('../scripts/voice-traits.json', import.meta.url));
        kokoroTraitsCache.traits = JSON.parse(await readFile(p, 'utf8'));
    } catch {
        kokoroTraitsCache.traits = {};
    }
    kokoroTraitsCache.at = Date.now();
    return kokoroTraitsCache.traits;
}
async function listKokoroVoices() {
    if (Date.now() - kokoroVoiceCache.at < 60_000 && kokoroVoiceCache.list.length) return kokoroVoiceCache.list;
    try {
        const voicesDir = fileURLToPath(new URL('../models/kokoro-zh/voices/', import.meta.url));
        const entries = await readdir(voicesDir);
        const traits = await loadKokoroTraits();
        kokoroVoiceCache.list = entries
            .filter((name) => /^z[fm]_\d{3}\.bin$/.test(name))
            .map((name) => {
                const id = name.replace(/\.bin$/, '');
                const gender = name.startsWith('zf_') ? '女声' : '男声';
                const trait = traits?.[id];
                return {
                    id,
                    gender,
                    style: trait ? `${gender} · ${trait}` : `${gender} · 本地离线音色`,
                };
            })
            .sort((a, b) => a.id.localeCompare(b.id));
        kokoroVoiceCache.at = Date.now();
    } catch {
        /* 模型未下载时返回空列表 */
    }
    return kokoroVoiceCache.list;
}

export function apply(ctx, config) {
    const cfg = resolveConfig(config);
    if (cfg.ttsEngine !== 'edge') {
        initKokoro(ctx.logger);
    } else {
        ttsState.engine = 'edge';
    }
    let webRegistered = false;
    const registerWebSurface = () => {
        if (webRegistered) return;
        const webServer = ctx.get(WEB_SERVER_KEYS[0]) ?? ctx.get(WEB_SERVER_KEYS[1]);
        const workspaceRegistry = ctx.get(WORKSPACE_KEYS[0]) ?? ctx.get(WORKSPACE_KEYS[1]);
        if (webServer === undefined || workspaceRegistry === undefined) return;
        webRegistered = true;

        ctx.effect(() => webServer.register({
            kind: 'exact',
            path: '/plugins/dsh-captain-call/state',
            handler: async (req, res) => {
                try {
                    const teams = await collectTeams(workspaceRegistry, cfg.stateDir);
                    const kokoroVoices = await listKokoroVoices();
                    res.writeHead(200, {
                        'content-type': 'application/json; charset=utf-8',
                        'cache-control': 'no-store',
                    });
                    res.end(JSON.stringify({
                        config: cfg,
                        serverTime: Date.now(),
                        tts: { engine: ttsState.engine, error: ttsState.initError },
                        voices: { kokoro: kokoroVoices, edge: EDGE_VOICES },
                        teams,
                    }));
                } catch (error) {
                    res.writeHead(500);
                    res.end(String(error));
                }
            },
        }), 'captain-call: state route');

        /* 语音桥 · 发话：把队长语音转文字投递给真实成员 agent */
        ctx.effect(() => webServer.register({
            kind: 'exact',
            path: '/plugins/dsh-captain-call/chat',
            handler: async (req, res) => {
                const respond = (code, payload) => {
                    res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
                    res.end(JSON.stringify(payload));
                };
                let body = '';
                try {
                    for await (const chunk of req) body += String(chunk);
                    const parsed = JSON.parse(body || '{}');
                    const { workspace, team, member, text } = parsed;
                    if (!workspace || !team || !member || !text || typeof text !== 'string' || !text.trim()) {
                        respond(400, { ok: false, error: 'bad request: workspace/team/member/text required' });
                        return;
                    }
                    const record = await readTeamRecord(workspaceRegistry, cfg.stateDir, workspace, team);
                    if (!record) { respond(404, { ok: false, error: 'team not found' }); return; }
                    const memberRec = (record.members ?? []).find((m) => m.name === member);
                    if (!memberRec?.id) { respond(404, { ok: false, error: 'member not found' }); return; }
                    const captain = ctx.agents.get(record.captainSessionId);
                    if (!captain) { respond(409, { ok: false, error: 'captain session offline' }); return; }
                    const prompt = `【实时语音通话】Daisy队长刚刚在电话里对你说："${text.trim()}"。`
                        + `请立即以你本人的身份，用一两句话简短、自然、口语化地回复她（模拟真实办公对话，不要客套长文，不要做其他任何工作）。`
                        + `回复请直接调用 agent_teams_send_message：to=captain，content=你的回复正文（只写回复本身，不要任何额外说明、不要加任何前缀）。`
                        + `这是最高优先级，收到消息后第一件事就是回这一句话。`;
                    await ctx.subagents.followup(captain, memberRec.id, [{ type: 'text', text: prompt }], {
                        source: { kind: 'plugin', plugin: 'dsh-captain-call' },
                        signal: AbortSignal.timeout(60_000),
                    });
                    respond(200, { ok: true, member: memberRec.id });
                } catch (error) {
                    respond(502, { ok: false, error: String(error) });
                }
            },
        }), 'captain-call: chat route');

        /* 语音桥 · 快速模式：队员人设 + 最近对话直接调 LLM 秒回；同时后台把原话存档给真实成员 agent */
        ctx.effect(() => webServer.register({
            kind: 'exact',
            path: '/plugins/dsh-captain-call/chat-fast',
            handler: async (req, res) => {
                const respond = (code, payload) => {
                    res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
                    res.end(JSON.stringify(payload));
                };
                let body = '';
                try {
                    for await (const chunk of req) body += String(chunk);
                    const parsed = JSON.parse(body || '{}');
                    const { workspace, team, member, text, history } = parsed;
                    if (!workspace || !team || !member || !text || typeof text !== 'string' || !text.trim()) {
                        respond(400, { ok: false, error: 'bad request: workspace/team/member/text required' });
                        return;
                    }
                    const record = await readTeamRecord(workspaceRegistry, cfg.stateDir, workspace, team);
                    if (!record) { respond(404, { ok: false, error: 'team not found' }); return; }
                    const memberRec = (record.members ?? []).find((m) => m.name === member);
                    if (!memberRec) { respond(404, { ok: false, error: 'member not found' }); return; }
                    const provider = memberRec.provider ?? 'deepseek-official';
                    const model = memberRec.model ?? 'deepseek-v4-pro';
                    const ownTasks = (record.tasks ?? []).filter((t) => t.assignee === member);
                    const taskSummary = ownTasks.length
                        ? ownTasks.map((t) => `- ${t.id}《${t.subject}》状态：${t.status}${t.updatedAt ? '，最后更新 ' + new Date(t.updatedAt).toLocaleString('zh-CN', { hour12: false }) : ''}`).join('\n')
                        : '（暂无分配给你的任务）';
                    const system = `你是${member}${memberRec.role ? `（${memberRec.role}）` : ''}，Daisy队长团队里的一名队员，`
                        + `此刻正在电话里和 Daisy 队长实时语音对话。请用一两句话、口语化、自然地回复她，模拟真实办公场景；`
                        + `不要长篇大论，不要复述队长的话，称呼她"队长"。`
                        + `\n你当前负责的任务（回答进度问题时以此为准）：\n${taskSummary}`;
                    const historyMessages = Array.isArray(history)
                        ? history.slice(-8).filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string').map((m) => ({ role: m.role, content: m.content }))
                        : [];
                    const callConfig = await ctx.llm.resolveCallConfig({ provider, model }, undefined);
                    /* 选择最轻的推理档位：deepseek-v4-pro 是推理模型，重推理会把 maxTokens 吃光导致没有正文 */
                    let reasoningEffort = callConfig.reasoningEffort;
                    try {
                        const info = await ctx.llm.resolveModelInfo(callConfig.provider, callConfig.model, undefined);
                        const efforts = (info.reasoning?.efforts ?? []).map((effort) => effort.id);
                        if (efforts.length) {
                            reasoningEffort = efforts.find((id) => /low|min|fast|none|0/i.test(String(id))) ?? efforts[0];
                        }
                    } catch {
                        /* 元数据查询失败则沿用 callConfig 默认 */
                    }
                    let replyText = '';
                    let debugInfo = null;
                    const attempts = [
                        { effort: reasoningEffort, maxTokens: 2048 },
                        { effort: undefined, maxTokens: 4096 },
                    ];
                    for (const attempt of attempts) {
                        const assembler = new BlockAssembler();
                        const stream = ctx.llm.stream({
                            provider: callConfig.provider,
                            model: callConfig.model,
                            ...(attempt.effort !== undefined ? { reasoningEffort: attempt.effort } : {}),
                            system,
                            messages: [...historyMessages],
                            maxTokens: attempt.maxTokens,
                        });
                        for await (const chunk of stream) assembler.push(chunk);
                        const assembled = assembler.message();
                        let text = '';
                        for (const block of assembled?.content ?? []) {
                            if (block?.type === 'text' && typeof block.text === 'string') text += block.text;
                        }
                        text = text.trim();
                        if (text) { replyText = text; debugInfo = null; break; }
                        debugInfo = {
                            finish: assembler.finish,
                            blockTypes: (assembled?.content ?? []).map((b) => b?.type),
                            effort: attempt.effort ?? null,
                            maxTokens: attempt.maxTokens,
                            model: callConfig.model,
                        };
                    }
                    /* 空回复兜底：附调试信息，便于定位适配器行为 */
                    if (!replyText) {
                        replyText = `队长，刚才信号不太好，我没听清，麻烦你再说一遍～（调试信息：${JSON.stringify(debugInfo)}）`;
                    }
                    /* 后台存档：把队长原话投递给真实成员 agent（不阻塞响应） */
                    const captain = ctx.agents.get(record.captainSessionId);
                    if (captain && memberRec.id) {
                        ctx.subagents.followup(captain, memberRec.id, [{
                            type: 'text',
                            text: `【通话存档】Daisy队长刚才在电话里对你说："${text.trim()}"（快速模式已由人设模型秒回，内容：${replyText || '（无）'}）。`
                                + `你只需了解这次通话内容；如认为有需要补充的重要信息，再调用 agent_teams_send_message 发 to=captain 补充即可，否则无需回复。`,
                        }], { source: { kind: 'plugin', plugin: 'dsh-captain-call' }, signal: AbortSignal.timeout(60_000) }).catch(() => {});
                    }
                    respond(200, { ok: true, reply: replyText, fast: true });
                } catch (error) {
                    respond(502, { ok: false, error: String(error) });
                }
            },
        }), 'captain-call: chat-fast route');

        /* 语音合成：Kokoro（开源本地）优先，msedge-tts 兜底 */
        ctx.effect(() => webServer.register({
            kind: 'exact',
            path: '/plugins/dsh-captain-call/tts',
            handler: async (req, res) => {
                const url = new URL(req.url ?? '/', 'http://x');
                const text = (url.searchParams.get('text') ?? '').slice(0, 500);
                const speaker = url.searchParams.get('speaker') ?? 'default';
                if (!text.trim()) {
                    res.writeHead(400);
                    res.end();
                    return;
                }
                try {
                    /* speaker 语义：
                       - /^z[fm]_\d{3}$/ → Kokoro 本地音色编号
                       - /^zh-/           → Edge 微软音色名
                       - 其它             → 旧版配置：成员名/“default”，查 voiceMap（Kokoro）与 voiceMapEdge（Edge） */
                    const isKokoroId = /^z[fm]_\d{3}$/.test(speaker);
                    const isEdgeId = /^zh-/.test(speaker);
                    if (ttsState.ready && cfg.ttsEngine !== 'edge' && (isKokoroId || !isEdgeId)) {
                        try {
                            const kokoroVoice = isKokoroId ? speaker : (cfg.voiceMap?.[speaker] ?? cfg.voiceMap?.default ?? 'zf_001');
                            if (/^z[fm]_\d{3}$/.test(kokoroVoice)) {
                                const voiceFile = fileURLToPath(new URL(`../models/kokoro-zh/voices/${kokoroVoice}.bin`, import.meta.url));
                                const { audio, sampling_rate } = await kokoroSynthesize(text, voiceFile);
                                const wav = encodeWav(audio, sampling_rate);
                                res.writeHead(200, { 'content-type': 'audio/wav', 'cache-control': 'no-store' });
                                res.end(wav);
                                return;
                            }
                        } catch (error) {
                            ctx.logger?.warn(`captain-call: kokoro synth failed (${String(error)}), using edge`);
                        }
                    }
                    const edgeVoice = isEdgeId ? speaker : (cfg.voiceMapEdge?.[speaker] ?? cfg.voiceMapEdge?.default ?? 'zh-CN-XiaoxiaoNeural');
                    const mp3 = await edgeSynthesize(text, edgeVoice);
                    res.writeHead(200, { 'content-type': 'audio/mpeg', 'cache-control': 'no-store' });
                    res.end(mp3);
                } catch (error) {
                    res.writeHead(500, { 'content-type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify({ ok: false, error: String(error) }));
                }
            },
        }), 'captain-call: tts route');

        /* 语音桥 · 拉回复：从队长邮箱 inbox/captain.jsonl 读取该成员的新回复 */
        ctx.effect(() => webServer.register({
            kind: 'exact',
            path: '/plugins/dsh-captain-call/replies',
            handler: async (req, res) => {
                const respond = (code, payload) => {
                    res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
                    res.end(JSON.stringify(payload));
                };
                try {
                    const url = new URL(req.url ?? '/', 'http://x');
                    const workspace = url.searchParams.get('workspace');
                    const team = url.searchParams.get('team');
                    const member = url.searchParams.get('member');
                    const after = Number(url.searchParams.get('after') ?? '0');
                    if (!workspace || !team || !member) { respond(400, { ok: false, error: 'workspace/team/member required' }); return; }
                    const root = workspaceRegistry.list().find((w) => w.title === workspace);
                    if (!root) { respond(404, { ok: false, error: 'workspace not found' }); return; }
                    const inboxPath = join(root.path, cfg.stateDir, team, 'inbox', 'captain.jsonl');
                    const raw = await readFile(inboxPath, 'utf8');
                    const replies = [];
                    for (const line of raw.split('\n')) {
                        if (!line.trim()) continue;
                        let entry;
                        try { entry = JSON.parse(line); } catch { continue; }
                        if (entry.from !== member || entry.to !== 'captain') continue;
                        if (typeof entry.ts !== 'number' || entry.ts <= after) continue;
                        replies.push({ from: entry.from, content: entry.content, ts: entry.ts });
                    }
                    replies.sort((a, b) => a.ts - b.ts);
                    respond(200, { ok: true, replies });
                } catch (error) {
                    respond(500, { ok: false, error: String(error) });
                }
            },
        }), 'captain-call: replies route');

        const artDir = fileURLToPath(new URL('../assets/', import.meta.url));
        ctx.effect(() => webServer.register({
            kind: 'prefix',
            path: '/plugins/dsh-captain-call/assets',
            handler: async (req, res) => {
                let asset;
                try {
                    asset = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname.split('/').pop() ?? '');
                } catch {
                    res.writeHead(404);
                    res.end();
                    return;
                }
                if (!ASSET_ALLOWLIST.has(asset)) {
                    res.writeHead(404);
                    res.end();
                    return;
                }
                try {
                    const data = await readFile(join(artDir, asset));
                    const ext = asset.endsWith('.svg') ? 'image/svg+xml' : asset.endsWith('.m4a') ? 'audio/mp4' : 'image/png';
                    res.writeHead(200, {
                        'content-type': ext,
                        'cache-control': 'public, max-age=86400',
                    });
                    res.end(data);
                } catch (error) {
                    ctx.logger?.warn(`captain-call: asset read failed for ${asset}: ${String(error)}`);
                    res.writeHead(404);
                    res.end();
                }
            },
        }), 'captain-call: artwork route');
    };
    registerWebSurface();
    ctx.on('internal/service', (serviceName) => {
        if (WEB_SERVER_KEYS.includes(serviceName) || WORKSPACE_KEYS.includes(serviceName)) {
            registerWebSurface();
        }
    });
}
