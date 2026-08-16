window.__ModuleLoader__.load({
	id: "@dsh-external/dsh-client-ui-captain-call",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		const PLUGIN_ID = "@dsh-external/dsh-client-ui-captain-call";
		const STATE_URL = "/plugins/dsh-captain-call/state";
		const ASSET_URL = "/plugins/dsh-captain-call/assets";
		const SEEN_KEY = "dsh-captain-call.seen-v1";
		const HISTORY_KEY = "dsh-captain-call.history-v1";

		const CSS = `/* ============ Apple Liquid Glass · 队长来电 UI ============
   参考：stormaref/LiquidGlassSkill、CSS-Tricks Liquid Glass、naplesblue/apple-design-skill */
#dsh-captain-call-root, #dsh-captain-call-root * { box-sizing: border-box; }
#dsh-captain-call-root {
  --lg-blur: blur(36px) saturate(200%);
  --lg-blur-strong: blur(48px) saturate(220%);
  --lg-bg: linear-gradient(135deg, rgba(255,255,255,0.52), rgba(255,255,255,0.16));
  --lg-bg-elevated: linear-gradient(135deg, rgba(255,255,255,0.66), rgba(255,255,255,0.26));
  --lg-fill: rgba(255,255,255,0.4);
  --lg-fill-hover: rgba(255,255,255,0.55);
  --lg-border: rgba(255,255,255,0.45);
  --lg-highlight: inset 0 1px 0 rgba(255,255,255,0.65), inset 0 -1px 0 rgba(255,255,255,0.15);
  --lg-shadow: 0 16px 48px rgba(0,0,0,0.18), 0 2px 10px rgba(0,0,0,0.08);
  --dcc-text: #1c1c1e;
  --dcc-text-2: #6e6e73;
  --dcc-text-3: #a2a2a8;
  --dcc-accent: #0a84ff;
  --dcc-green: #34c759;
  --dcc-green-2: #28b34a;
  --dcc-red: #ff3b30;
  --dcc-sep: rgba(0,0,0,0.08);
}
body[data-ds-dark-theme] #dsh-captain-call-root {
  --lg-bg: linear-gradient(135deg, rgba(60,60,66,0.55), rgba(28,28,32,0.28));
  --lg-bg-elevated: linear-gradient(135deg, rgba(72,72,78,0.66), rgba(38,38,44,0.36));
  --lg-fill: rgba(120,120,130,0.22);
  --lg-fill-hover: rgba(120,120,130,0.34);
  --lg-border: rgba(255,255,255,0.16);
  --lg-highlight: inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.2);
  --lg-shadow: 0 18px 52px rgba(0,0,0,0.5);
  --dcc-text: #f5f5f7;
  --dcc-text-2: #a8a8b0;
  --dcc-text-3: #787880;
  --dcc-sep: rgba(255,255,255,0.09);
}
.dcc-font { font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Helvetica Neue", "Microsoft YaHei", sans-serif; }

/* ---- 桌面助手挂件（iOS Dock 图标质感） ---- */
.dcc-boss { position: fixed; right: 20px; bottom: 20px; z-index: 2147483000; width: 84px; height: 84px; border-radius: 50%; cursor: pointer; transition: transform .25s cubic-bezier(.2,.8,.3,1.2); }
.dcc-boss:hover { transform: scale(1.08); }
.dcc-boss img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; object-position: 50% 12%; display: block; border: 2px solid rgba(255,255,255,0.6); box-shadow: 0 10px 30px rgba(0,0,0,0.22), inset 0 2px 4px rgba(255,255,255,0.35); }
.dcc-boss::after { content: ""; position: absolute; inset: -7px; border-radius: 50%; border: 1.5px solid var(--dcc-accent); opacity: 0; transition: opacity .25s; pointer-events: none; }
.dcc-boss:hover::after { opacity: .8; }
.dcc-boss .dcc-badge { position: absolute; right: -2px; top: -2px; min-width: 21px; height: 21px; border-radius: 10.5px; background: linear-gradient(180deg, #ff5f52, var(--dcc-red)); color: #fff; font-size: 11px; line-height: 21px; text-align: center; padding: 0 6px; font-family: -apple-system, sans-serif; display: none; box-shadow: 0 2px 6px rgba(0,0,0,0.3); }

/* ---- 助手面板（Liquid Glass 浮窗） ---- */
.dcc-panel { position: relative; position: fixed; right: 20px; bottom: 118px; z-index: 2147483000; width: 352px; max-height: 66vh; overflow: auto; background: var(--lg-bg); -webkit-backdrop-filter: var(--lg-blur); backdrop-filter: var(--lg-blur); border: 1px solid var(--lg-border); border-radius: 20px; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Microsoft YaHei", sans-serif; color: var(--dcc-text); box-shadow: var(--lg-highlight), var(--lg-shadow); display: none; }
.dcc-panel.open { display: block; }
.dcc-panel-head { display: flex; align-items: center; gap: 8px; padding: 14px 16px 10px; position: sticky; top: 0; z-index: 2; }
.dcc-panel-head .dcc-dots { display: flex; gap: 7px; }
.dcc-panel-head .dcc-dot { width: 11px; height: 11px; border-radius: 50%; box-shadow: inset 0 1px 1px rgba(255,255,255,0.4), 0 1px 2px rgba(0,0,0,0.15); }
.dcc-dot.r { background: linear-gradient(180deg, #ff7a6e, #ff5f57); } .dcc-dot.y { background: linear-gradient(180deg, #ffd60a, #febc2e); } .dcc-dot.g { background: linear-gradient(180deg, #34d058, #28c840); }
.dcc-panel-head .dcc-panel-title { font-size: 13.5px; font-weight: 650; color: var(--dcc-text); letter-spacing: .2px; }
.dcc-panel-body { padding: 2px 16px 16px; }
.dcc-panel button { display: block; width: 100%; margin: 6px 0; padding: 9px 12px; border-radius: 12px; border: 1px solid var(--lg-border); background: var(--lg-fill); -webkit-backdrop-filter: blur(20px) saturate(180%); backdrop-filter: blur(20px) saturate(180%); color: var(--dcc-text); cursor: pointer; font-size: 12.5px; font-weight: 600; font-family: inherit; box-shadow: inset 0 1px 0 rgba(255,255,255,0.35); transition: background .15s, transform .05s; }
.dcc-panel button:hover { background: var(--lg-fill-hover); }
.dcc-panel button:active { transform: scale(.98); }
.dcc-log { list-style: none; margin: 8px 0 0; padding: 0; font-size: 11.5px; color: var(--dcc-text-2); }
.dcc-log li { padding: 5px 2px; border-top: 1px solid var(--dcc-sep); }

/* ---- 通讯录（iOS 列表质感） ---- */
.dcc-contacts-title { font-size: 12px; color: var(--dcc-text-2); margin: 12px 0 4px; font-weight: 650; letter-spacing: .3px; }
.dcc-contact { position: relative; display: flex; align-items: center; gap: 10px; width: 100%; padding: 9px 10px; margin: 3px 0; border-radius: 14px; cursor: pointer; transition: background .15s; border: 1px solid transparent; }
.dcc-contact:hover { background: var(--lg-fill); border-color: var(--lg-border); box-shadow: inset 0 1px 0 rgba(255,255,255,0.3); }
.dcc-contact img { width: 42px; height: 42px; border-radius: 50%; object-fit: cover; object-position: 50% 12%; flex: none; border: 1.5px solid rgba(255,255,255,0.55); box-shadow: 0 2px 8px rgba(0,0,0,0.18), inset 0 1px 2px rgba(255,255,255,0.3); }
.dcc-contact-meta { text-align: left; min-width: 0; flex: 1; }
.dcc-contact-name { font-size: 13px; font-weight: 650; color: var(--dcc-text); }
.dcc-contact-role { font-size: 11px; color: var(--dcc-text-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dcc-contact-voice { font-size: 10.5px; color: var(--dcc-text-3); margin-top: 1px; }
.dcc-contact-actions { display: flex; gap: 6px; flex: none; }
.dcc-contact-callbtn { padding: 6px 14px; border-radius: 999px; border: none; background: linear-gradient(180deg, #3cdb64, var(--dcc-green-2)); color: #fff; font-size: 11.5px; font-weight: 650; cursor: pointer; font-family: inherit; box-shadow: 0 3px 8px rgba(52,199,89,.4), inset 0 1px 0 rgba(255,255,255,.3); transition: transform .05s, filter .15s; }
.dcc-contact-callbtn:hover { filter: brightness(1.05); }
.dcc-contact-callbtn:active { transform: scale(.94); }
.dcc-contact-voicebtn { padding: 6px 14px; border-radius: 999px; border: 1px solid var(--dcc-accent); background: rgba(10,132,255,0.1); -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px); color: var(--dcc-accent); font-size: 11.5px; font-weight: 650; cursor: pointer; font-family: inherit; transition: background .15s; }
.dcc-contact-voicebtn:hover { background: rgba(10,132,255,0.2); }
.dcc-contacts-empty { font-size: 12px; color: var(--dcc-text-3); padding: 6px 2px; }

/* ---- 声线选择器（iOS Sheet 玻璃） ---- */
.dcc-voice-mask { position: fixed; inset: 0; z-index: 2147483002; background: rgba(0,0,0,0.25); -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; }
.dcc-voice-box { position: relative; width: 440px; max-width: 94vw; height: 72vh; max-height: 660px; display: flex; flex-direction: column; overflow: hidden; background: var(--lg-bg-elevated); -webkit-backdrop-filter: var(--lg-blur-strong); backdrop-filter: var(--lg-blur-strong); border: 1px solid var(--lg-border); border-radius: 22px; font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Microsoft YaHei", sans-serif; color: var(--dcc-text); box-shadow: var(--lg-highlight), var(--lg-shadow); }
.dcc-voice-box::before { content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none; background: radial-gradient(130% 60% at 15% 0%, rgba(255,255,255,0.3), transparent 50%); opacity: .8; }
body[data-ds-dark-theme] .dcc-voice-box::before { opacity: .3; }
.dcc-voice-head { position: relative; padding: 18px 20px 12px; border-bottom: 1px solid var(--dcc-sep); }
.dcc-voice-head h4 { margin: 0 0 12px; text-align: center; font-size: 16px; font-weight: 700; letter-spacing: .2px; }
.dcc-voice-search { width: 100%; padding: 9px 14px; border-radius: 12px; border: 1px solid var(--lg-border); background: var(--lg-fill); -webkit-backdrop-filter: blur(20px); backdrop-filter: blur(20px); color: var(--dcc-text); font-size: 13px; font-family: inherit; outline: none; margin-bottom: 10px; box-shadow: inset 0 1px 2px rgba(0,0,0,0.06); }
.dcc-voice-search::placeholder { color: var(--dcc-text-3); }
.dcc-voice-search:focus { border-color: var(--dcc-accent); box-shadow: 0 0 0 4px rgba(10,132,255,0.16); }
.dcc-voice-filter { display: flex; gap: 2px; padding: 3px; border-radius: 10px; background: var(--lg-fill); border: 1px solid var(--lg-border); }
.dcc-voice-filter button { flex: 1; padding: 6px 8px; border-radius: 8px; border: none; background: transparent; color: var(--dcc-text-2); cursor: pointer; font-size: 12.5px; font-weight: 600; font-family: inherit; transition: all .18s; }
.dcc-voice-filter button.on { background: var(--lg-bg-elevated); color: var(--dcc-text); box-shadow: 0 2px 6px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.4); }
.dcc-voice-rows { position: relative; flex: 1; overflow: auto; padding: 6px 16px; }
.dcc-voice-sec { font-size: 11.5px; font-weight: 700; color: var(--dcc-text-3); text-transform: uppercase; letter-spacing: .6px; margin: 14px 0 2px; position: sticky; top: 0; z-index: 1; padding: 4px 0; }
.dcc-voice-row { position: relative; display: flex; align-items: center; gap: 8px; padding: 8px 8px; border-radius: 12px; font-size: 12.5px; transition: background .12s; }
.dcc-voice-row:hover { background: var(--lg-fill); }
.dcc-voice-row .vname { flex: 1.2; min-width: 0; font-weight: 650; }
.dcc-voice-row .vstyle { flex: 1; min-width: 0; color: var(--dcc-text-2); font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dcc-voice-row button { flex: none; padding: 4px 13px; border-radius: 999px; border: 1px solid var(--lg-border); background: var(--lg-fill); -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px); color: var(--dcc-text); cursor: pointer; font-size: 11.5px; font-weight: 600; font-family: inherit; transition: all .15s; }
.dcc-voice-row button:hover { border-color: var(--dcc-accent); color: var(--dcc-accent); }
.dcc-voice-row button.cur { background: linear-gradient(180deg, #3cdb64, var(--dcc-green-2)); border-color: transparent; color: #fff; box-shadow: 0 2px 6px rgba(52,199,89,.35); }
.dcc-voice-row button.loading { opacity: .55; pointer-events: none; }
.dcc-voice-foot { position: relative; padding: 12px 20px 18px; border-top: 1px solid var(--dcc-sep); display: flex; gap: 8px; justify-content: center; }
.dcc-voice-close { flex: 1; padding: 8px 14px; border-radius: 12px; border: 1px solid var(--lg-border); background: var(--lg-fill); -webkit-backdrop-filter: blur(20px); backdrop-filter: blur(20px); color: var(--dcc-text); cursor: pointer; font-family: inherit; font-size: 13px; font-weight: 600; }

/* ---- 通话卡片（微信布局 + Liquid Glass 材质） ---- */
.dcc-wx-mask { position: fixed; inset: 0; z-index: 2147483001; display: none; align-items: center; justify-content: center; overflow: hidden; }
.dcc-wx-mask.open { display: flex; }
.dcc-wx-blur { position: absolute; inset: -40px; background-size: cover; background-position: center; filter: blur(40px) brightness(.72) saturate(1.2); }
.dcc-wx-card { position: relative; width: 330px; max-width: 92vw; background: var(--lg-bg-elevated); -webkit-backdrop-filter: var(--lg-blur-strong); backdrop-filter: var(--lg-blur-strong); border: 1px solid var(--lg-border); border-radius: 24px; padding: 30px 20px 22px; text-align: center; font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Microsoft YaHei", sans-serif; color: var(--dcc-text); box-shadow: var(--lg-highlight), var(--lg-shadow); }
.dcc-wx-card::before { content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none; background: radial-gradient(120% 50% at 50% 0%, rgba(255,255,255,0.28), transparent 55%); opacity: .7; }
body[data-ds-dark-theme] .dcc-wx-card::before { opacity: .25; }
.dcc-wx-card .dcc-wx-avatar { width: 96px; height: 96px; border-radius: 50%; object-fit: cover; object-position: 50% 12%; margin: 0 auto 12px; display: block; border: 2px solid rgba(255,255,255,0.55); box-shadow: 0 10px 28px rgba(0,0,0,0.22), inset 0 2px 4px rgba(255,255,255,0.3); }
.dcc-wx-card .dcc-wx-name { font-size: 17.5px; font-weight: 700; }
.dcc-wx-card .dcc-wx-sub { font-size: 12.5px; color: var(--dcc-text-2); margin: 6px 0 16px; }
.dcc-wx-card .dcc-wx-sub .dcc-wx-bell { display: inline-block; animation: dcc-wx-swing 0.9s ease-in-out infinite; }
@keyframes dcc-wx-swing { 0%,100% { transform: rotate(0); } 25% { transform: rotate(-16deg); } 75% { transform: rotate(16deg); } }
.dcc-wx-card .dcc-wx-actions { display: flex; justify-content: center; gap: 54px; margin: 4px 0 2px; position: relative; }
.dcc-wx-btn { width: 58px; height: 58px; border-radius: 50%; border: none; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; color: #fff; box-shadow: 0 8px 18px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.35); transition: transform .12s ease; }
.dcc-wx-btn:hover { transform: scale(1.08); }
.dcc-wx-btn.decline { background: linear-gradient(180deg, #ff6258, var(--dcc-red)); }
.dcc-wx-btn.accept { background: linear-gradient(180deg, #3cdb64, var(--dcc-green-2)); animation: dcc-wx-pulse 1.2s ease-in-out infinite; }
@keyframes dcc-wx-pulse { 0%,100% { box-shadow: 0 8px 18px rgba(0,0,0,0.25), 0 0 0 0 rgba(52,199,89,0.45); } 50% { box-shadow: 0 8px 18px rgba(0,0,0,0.25), 0 0 0 16px rgba(52,199,89,0); } }
.dcc-wx-bubble { display: none; margin: 14px 0 0; background: var(--lg-fill); -webkit-backdrop-filter: blur(16px); backdrop-filter: blur(16px); border: 1px solid var(--lg-border); border-radius: 14px; padding: 10px 12px; font-size: 13px; line-height: 1.6; text-align: left; color: var(--dcc-text); white-space: pre-wrap; max-height: 170px; overflow: auto; }
.dcc-wx-toolrow { display: flex; gap: 8px; justify-content: center; margin-top: 12px; flex-wrap: wrap; position: relative; }
.dcc-wx-toolrow button { padding: 7px 15px; border-radius: 999px; border: 1px solid var(--lg-border); background: var(--lg-fill); -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px); color: var(--dcc-text); cursor: pointer; font-size: 12.5px; font-weight: 600; font-family: inherit; }
.dcc-wx-toolrow button:hover { background: var(--lg-fill-hover); }
.dcc-wx-ringbtn { display: none; width: 100%; margin: 10px 0 4px; padding: 11px 12px; border-radius: 14px; border: none; background: linear-gradient(180deg, #3cdb64, var(--dcc-green-2)); color: #fff; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit; box-shadow: 0 4px 12px rgba(52,199,89,.4); }
.dcc-wx-typing { margin-top: 6px; font-size: 12px; color: var(--dcc-text-3); font-style: italic; animation: dcc-wx-blink 1.2s ease-in-out infinite; }
@keyframes dcc-wx-blink { 0%,100% { opacity: 1; } 50% { opacity: .35; } }
.dcc-wx-inputrow { display: none; margin-top: 10px; gap: 6px; position: relative; }
.dcc-wx-inputrow input { flex: 1; min-width: 0; padding: 9px 14px; border-radius: 999px; border: 1px solid var(--lg-border); background: var(--lg-fill); -webkit-backdrop-filter: blur(16px); backdrop-filter: blur(16px); color: var(--dcc-text); font-size: 13px; font-family: inherit; outline: none; }
.dcc-wx-inputrow input:focus { border-color: var(--dcc-green); box-shadow: 0 0 0 4px rgba(52,199,89,0.16); }
.dcc-wx-inputrow button { flex: none; padding: 9px 18px; border-radius: 999px; border: none; background: linear-gradient(180deg, #3cdb64, var(--dcc-green-2)); color: #fff; font-size: 13px; font-weight: 650; cursor: pointer; font-family: inherit; box-shadow: 0 3px 8px rgba(52,199,89,.35); }

/* ---- 授权弹窗（保留兼容） ---- */
.dcc-ask { position: fixed; inset: 0; z-index: 2147483002; background: rgba(0,0,0,0.25); -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px); display: none; align-items: center; justify-content: center; }
.dcc-ask.open { display: flex; }
.dcc-ask-box { position: relative; width: 330px; max-width: 92vw; background: var(--lg-bg-elevated); -webkit-backdrop-filter: var(--lg-blur-strong); backdrop-filter: var(--lg-blur-strong); border: 1px solid var(--lg-border); border-radius: 18px; padding: 20px; font-family: inherit; color: var(--dcc-text); text-align: center; box-shadow: var(--lg-highlight), var(--lg-shadow); }
.dcc-ask-box p { margin: 8px 0 14px; font-size: 14px; }
.dcc-ask-box .dcc-actions { display: flex; gap: 10px; justify-content: center; }
.dcc-ask-box button { padding: 8px 16px; border-radius: 999px; border: 1px solid var(--lg-border); background: var(--lg-fill); color: var(--dcc-text); cursor: pointer; font-size: 13px; font-weight: 600; font-family: inherit; }
.dcc-ask-box button.primary { background: linear-gradient(180deg, #3b9dff, var(--dcc-accent)); color: #fff; border-color: transparent; }
`;

		function el(tag, attrs = {}, children = []) {
			const node = document.createElement(tag);
			for (const [key, value] of Object.entries(attrs)) {
				if (key === "text") node.textContent = value;
				else if (key === "html") node.innerHTML = value;
				else if (key.startsWith("on")) node.addEventListener(key.slice(2), value);
				else node.setAttribute(key, String(value));
			}
			for (const child of children) if (child) node.append(child);
			return node;
		}

		function loadJSON(key, fallback) {
			try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
		}
		function saveJSON(key, value) {
			try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
		}

		function pickZhVoice() {
			const voices = window.speechSynthesis?.getVoices() ?? [];
			return (
				voices.find((v) => /zh[-_]CN/i.test(v.lang) && /xiaoxiao|huihui|yunxi|yaoyao|kangkang|xiaoqiu/i.test(v.name)) ||
				voices.find((v) => /zh[-_]CN/i.test(v.lang)) ||
				voices.find((v) => /^zh/i.test(v.lang))
			);
		}

		function fill(template, map) {
			return String(template).replace(/\{(\w+)\}/g, (_, key) => (map[key] !== undefined ? String(map[key]) : `{${key}}`));
		}

		function apply(ctx) {
			if (document.getElementById("dsh-captain-call-root")) {
				/* 重复激活（HMR / 双重加载）：跳过，避免挂件与来电卡片叠加、按钮失灵 */
				ctx.effect(() => () => {}, "captain-call: duplicate guard");
				return;
			}
			const style = document.createElement("style");
			style.dataset.plugin = PLUGIN_ID;
			style.textContent = CSS;
			document.head.appendChild(style);

			const root = document.createElement("div");
			root.id = "dsh-captain-call-root";
			document.body.appendChild(root);

			let cfg = null;
			let baselineDone = false;
			let muted = false;
			let currentCall = null;
			let micStream = null;
			let recognition = null;
			let autoAnswerTimer = null;

			const seen = new Set(loadJSON(SEEN_KEY, []));
			const history = loadJSON(HISTORY_KEY, []);
			const persistSeen = () => saveJSON(SEEN_KEY, [...seen].slice(-2000));

			/* ---------- 语音播报（Kokoro/Edge 引擎音频流 → 浏览器播放，失败回退系统 TTS） ---------- */
			function speakerFor() {
				const member = currentCall?.member;
				if (!member || member === (cfg?.bossName ?? "Daisy")) return voiceChoices[member] ?? cfg?.voiceMap?.ginka ?? "default";
				return voiceChoices[member] ?? cfg?.voiceMap?.[member] ?? cfg?.voiceMap?.default ?? "default";
			}
			function speakWithSystem(text, onEnd) {
				if (!("speechSynthesis" in window)) { onEnd?.(); return; }
				try {
					window.speechSynthesis.cancel();
					const u = new SpeechSynthesisUtterance(text);
					u.lang = "zh-CN";
					u.rate = Number(cfg?.speechRate ?? 1);
					const voice = pickZhVoice();
					if (voice) u.voice = voice;
					u.onend = () => onEnd?.();
					u.onerror = () => onEnd?.();
					window.speechSynthesis.speak(u);
				} catch { onEnd?.(); }
			}
			let ttsAudio = null;
			const speakQueue = [];
			let speakBusy = false;
			let ttsSpeaking = false;
			let currentSpeakResolver = null;
			function stopSpeak() {
				speakQueue.length = 0;
				try { ttsAudio?.pause(); } catch {}
				ttsAudio = null;
				try { window.speechSynthesis?.cancel(); } catch {}
				try { currentSpeakResolver?.(); } catch {}
				currentSpeakResolver = null;
				speakBusy = false;
				ttsSpeaking = false;
			}
			/* 串行播报队列：多条回复按顺序念，绝不重叠；播报期间自动暂停聆听，念完自动恢复。
			   真人对话习惯：用户开口说话 → 立即停播并清队；用户说话期间新回复排队等待，停口 1.5 秒后再念 */
			function userTalking() {
				return listening && Date.now() - lastSpeechAt < 1500;
			}
			function pumpSpeak() {
				if (speakBusy || speakQueue.length === 0 || muted) return;
				if (userTalking()) {
					/* 队长正在说话，队员别插嘴：稍后再试 */
					setTimeout(pumpSpeak, 700);
					return;
				}
				speakBusy = true;
				const item = speakQueue.shift();
				ttsSpeaking = true;
				pauseListeningForTts();
				const finish = () => {
					ttsSpeaking = false;
					speakBusy = false;
					currentSpeakResolver = null;
					try { item.onEnd?.(); } catch {}
					resumeListeningAfterTts();
					pumpSpeak();
				};
				(async () => {
					try {
						const response = await fetch(`/plugins/dsh-captain-call/tts?text=${encodeURIComponent(item.text)}&speaker=${encodeURIComponent(speakerFor())}`, { cache: "no-store" });
						if (!response.ok) throw new Error("tts http " + response.status);
						const blob = await response.blob();
						if (!blob.size) throw new Error("empty audio");
						const url = URL.createObjectURL(blob);
						ttsAudio = new Audio(url);
						await new Promise((resolve) => {
							currentSpeakResolver = resolve;
							ttsAudio.onended = () => { URL.revokeObjectURL(url); ttsAudio = null; resolve(); };
							ttsAudio.onerror = () => { URL.revokeObjectURL(url); ttsAudio = null; resolve(); };
							ttsAudio.play().catch(() => resolve());
						});
					} catch {
						await new Promise((resolve) => speakWithSystem(item.text, resolve));
					}
					finish();
				})();
			}
			function speak(text, onEnd) {
				if (muted) { onEnd?.(); return; }
				speakQueue.push({ text: String(text).slice(0, 400), onEnd });
				pumpSpeak();
			}

			/* ---------- 老板助手挂件（GINKA） ---------- */
			const boss = el("div", { class: "dcc-boss", title: "ginka 队长助手 · 点击查看来电记录" });
			const bossImg = el("img", { src: ASSET_URL + "/ginka.png", alt: "ginka" });
			const badge = el("span", { class: "dcc-badge", text: "" });
			boss.append(bossImg, badge);
			const panel = el("div", { class: "dcc-panel" });
			const panelHead = el("div", { class: "dcc-panel-head" });
			const dots = el("div", { class: "dcc-dots" });
			dots.append(el("span", { class: "dcc-dot r" }), el("span", { class: "dcc-dot y" }), el("span", { class: "dcc-dot g" }));
			panelHead.append(dots, el("span", { class: "dcc-panel-title", text: "队长来电" }));
			const panelBody = el("div", { class: "dcc-panel-body" });
			const contactsTitle = el("div", { class: "dcc-contacts-title", text: "通讯录" });
			const contacts = el("div", { class: "dcc-contacts" });
			const testBtn = el("button", { text: "测试来电" });
			const muteBtn = el("button", { text: "静音开关：关" });
			const logTitle = el("div", { class: "dcc-contacts-title", text: "来电记录" });
			const log = el("ul", { class: "dcc-log" });
			panelBody.append(contactsTitle, contacts, testBtn, muteBtn, logTitle, log);
			panel.append(panelHead, panelBody);
			root.append(boss, panel);

			let lastTeams = [];
			let voiceCatalog = { kokoro: [], edge: [] };
			let voiceChoices = loadJSON("dsh-captain-call.voices-v1", {});
			const persistVoices = () => saveJSON("dsh-captain-call.voices-v1", voiceChoices);
			const voiceLabelOf = (id) => {
				const k = voiceCatalog.kokoro.find((v) => v.id === id);
				if (k) return `${k.id}（${k.gender}）`;
				const e = voiceCatalog.edge.find((v) => v.id === id);
				if (e) return `${e.style}`;
				return id;
			};

			const renderContacts = () => {
				contacts.replaceChildren();
				const seenMembers = new Map();
				for (const team of lastTeams) {
					for (const member of team.members ?? []) {
						if (!seenMembers.has(member.name)) {
							seenMembers.set(member.name, { name: member.name, role: member.role, workspace: team.workspace, teamId: team.team, teamName: team.name });
						}
					}
				}
				if (!seenMembers.size) {
					contacts.append(el("div", { class: "dcc-contacts-empty", text: "（暂无团队通讯录，创建 AgentTeams 团队后自动出现）" }));
					return;
				}
				for (const [name, info] of seenMembers) {
					const row = el("div", { class: "dcc-contact" });
					const img = el("img", { src: ASSET_URL + "/" + (avatarFor(name) || "placeholder.svg"), alt: name });
					const meta = el("div", { class: "dcc-contact-meta" });
					const voiceChoice = voiceChoices[name];
					meta.append(
						el("div", { class: "dcc-contact-name", text: name }),
						el("div", { class: "dcc-contact-role", text: info.role ?? "" }),
						el("div", { class: "dcc-contact-voice", text: `声线：${voiceChoice ? voiceLabelOf(voiceChoice) : "默认"}` })
					);
					row.append(img, meta);
					const actions = el("div", { class: "dcc-contact-actions" });
					const callBtn = el("button", { class: "dcc-contact-callbtn", text: "📞 拨打" });
					callBtn.addEventListener("click", (event) => {
						event.stopPropagation();
						outgoingCall(info);
					});
					const voiceBtn = el("button", { class: "dcc-contact-voicebtn", text: "声线" });
					voiceBtn.addEventListener("click", (event) => {
						event.stopPropagation();
						openVoicePicker(name);
					});
					actions.append(callBtn, voiceBtn);
					row.append(actions);
					row.addEventListener("click", () => outgoingCall(info));
					contacts.append(row);
				}
			};
			renderContacts();

			/* ---------- 声线选择器（macOS Sheet：搜索 + 筛选 + 试听 + 就地更新选中态） ---------- */
			let voiceFilter = "all";
			let previewAudio = null;
			let previewTimer = null;
			function playPreview(id, btn) {
				try { previewAudio?.pause(); } catch {}
				const restore = () => {
					if (btn) {
						btn.classList.remove("loading");
						btn.textContent = "🔊 试听";
					}
				};
				if (btn) {
					btn.classList.add("loading");
					btn.textContent = "合成中…";
				}
				clearTimeout(previewTimer);
				previewTimer = setTimeout(restore, 15000);
				const url = `/plugins/dsh-captain-call/tts?text=${encodeURIComponent("队长你好，我是你的队员，请多关照。")}&speaker=${encodeURIComponent(id)}`;
				previewAudio = new Audio(url);
				previewAudio.onplaying = () => { clearTimeout(previewTimer); restore(); };
				previewAudio.onerror = () => { clearTimeout(previewTimer); restore(); };
				previewAudio.play().catch(() => { clearTimeout(previewTimer); restore(); });
			}
			function openVoicePicker(name) {
				voiceFilter = "all";
				const mask = el("div", { class: "dcc-voice-mask" });
				const box = el("div", { class: "dcc-voice-box" });
				const head = el("div", { class: "dcc-voice-head" });
				const title = el("h4", { text: `${name} · 声线` });
				const search = el("input", { class: "dcc-voice-search", type: "text", placeholder: "搜索声线（编号或风格）…" });
				const filter = el("div", { class: "dcc-voice-filter" });
				const makeFilter = (label, value) => {
					const b = el("button", { text: label });
					if (voiceFilter === value) b.classList.add("on");
					b.addEventListener("click", () => {
						voiceFilter = value;
						[...filter.children].forEach((child) => child.classList.remove("on"));
						b.classList.add("on");
						renderRows();
					});
					filter.append(b);
				};
				makeFilter("全部", "all");
				makeFilter("女声", "女声");
				makeFilter("男声", "男声");
				head.append(title, search, filter);
				const rowsWrap = el("div", { class: "dcc-voice-rows" });
				/* 选中后只就地更新按钮状态，不整表重绘（消除延迟感） */
				const updateSelectedMarks = () => {
					for (const btn of rowsWrap.querySelectorAll("button[data-vid]")) {
						const isCur = voiceChoices[name] === btn.dataset.vid;
						btn.classList.toggle("cur", isCur);
						btn.textContent = isCur ? "已选" : "选择";
					}
				};
				const renderRows = () => {
					rowsWrap.replaceChildren();
					const q = search.value.trim().toLowerCase();
					const matches = (v) => !q || v.id.toLowerCase().includes(q) || (v.style ?? "").toLowerCase().includes(q);
					const kokoro = voiceCatalog.kokoro.filter((v) => (voiceFilter === "all" || v.gender === voiceFilter) && matches(v));
					const edge = voiceCatalog.edge.filter((v) => (voiceFilter === "all" || v.gender === voiceFilter) && matches(v));
					const appendSection = (label, list) => {
						if (!list.length) return;
						rowsWrap.append(el("div", { class: "dcc-voice-sec", text: label }));
						for (const v of list) {
							const row = el("div", { class: "dcc-voice-row" });
							const nm = el("span", { class: "vname", text: v.id });
							const st = el("span", { class: "vstyle", text: v.style ?? "" });
							const listen = el("button", { text: "🔊 试听" });
							listen.addEventListener("click", () => playPreview(v.id, listen));
							const choose = el("button", { text: voiceChoices[name] === v.id ? "已选" : "选择" });
							choose.dataset.vid = v.id;
							if (voiceChoices[name] === v.id) choose.classList.add("cur");
							choose.addEventListener("click", () => {
								voiceChoices[name] = v.id;
								persistVoices();
								updateSelectedMarks();
								renderContacts();
							});
							row.append(nm, st, listen, choose);
							rowsWrap.append(row);
						}
					};
					appendSection("🌐 本地开源 · Kokoro（离线）", kokoro);
					appendSection("☁️ 微软在线 · Edge", edge);
					if (!kokoro.length && !edge.length) {
						rowsWrap.append(el("div", { class: "dcc-contacts-empty", text: "（无匹配声线：Kokoro 模型请运行 scripts/download-models.ps1；Edge 需要网络）" }));
					}
				};
				const foot = el("div", { class: "dcc-voice-foot" });
				const reset = el("button", { class: "dcc-voice-close", text: "恢复默认" });
				reset.addEventListener("click", () => {
					delete voiceChoices[name];
					persistVoices();
					updateSelectedMarks();
					renderContacts();
				});
				const close = el("button", { class: "dcc-voice-close", text: "关闭" });
				close.addEventListener("click", () => {
					try { previewAudio?.pause(); } catch {}
					clearTimeout(previewTimer);
					mask.remove();
				});
				foot.append(reset, close);
				search.addEventListener("input", renderRows);
				renderRows();
				box.append(head, rowsWrap, foot);
				mask.append(box);
				root.append(mask);
				search.focus();
			}

			const renderLog = () => {
				log.replaceChildren();
				const rows = history.slice(-20).reverse();
				if (!rows.length) log.append(el("li", { text: "（暂无记录）" }));
				for (const row of rows) {
					log.append(el("li", { text: `${row.time} · ${row.who}：${row.text}` }));
				}
			};
			renderLog();
			boss.addEventListener("click", () => panel.classList.toggle("open"));
			testBtn.addEventListener("click", () => {
				panel.classList.remove("open");
				incomingCall({
					team: "（测试）",
					task: { id: "test", subject: "测试来电功能", status: "completed", createdAt: Date.now() - 60000, updatedAt: Date.now() },
					caller: cfg?.bossName ?? "Daisy",
					avatar: cfg?.bossAvatar ?? "ginka.png",
				}, true);
			});
			muteBtn.addEventListener("click", () => {
				muted = !muted;
				muteBtn.textContent = `静音：${muted ? "开" : "关"}`;
				if (muted) stopSpeak();
			});

			/* ---------- 麦克风授权：直接申请浏览器权限，不再弹插件确认框 ---------- */

			let lastReplyTs = 0;
			let listening = false;
			let micPausedByUser = false;
			let lastSpeechAt = 0;

			function syncMicButton() {
				const btn = currentCall?.micPause;
				if (!btn) return;
				if (micStream) {
					btn.style.display = "";
					btn.textContent = listening ? "⏸️ 暂停聆听" : "🎙️ 继续聆听";
				} else {
					btn.style.display = "none";
				}
			}

			function startRecognition() {
				const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
				if (!SR) {
					showBubble(`（此浏览器不支持语音识别。可以用打字回复：）`, true);
					typedFallback();
					return;
				}
				recognition = new SR();
				recognition.lang = "zh-CN";
				recognition.continuous = true;
				recognition.interimResults = true;
				recognition.onresult = (event) => {
					/* 检测到用户真的在说话：立刻停掉队员播报（真人习惯：人开口，对方闭嘴） */
					let hasSpeech = false;
					for (let i = event.resultIndex; i < event.results.length; i++) {
						const transcript = event.results[i][0]?.transcript ?? "";
						if (transcript.trim()) hasSpeech = true;
					}
					if (hasSpeech) {
						lastSpeechAt = Date.now();
						if (ttsSpeaking || ttsAudio) stopSpeak();
					}
					/* 队员正在说话（TTS 播放中）时忽略识别结果，避免把播报声录进去 */
					if (ttsSpeaking) return;
					for (let i = event.resultIndex; i < event.results.length; i++) {
						const result = event.results[i];
						if (result.isFinal) {
							const text = (result[0]?.transcript ?? "").trim();
							if (text) sendToMember(text);
						}
					}
				};
				recognition.onend = () => {
					/* 通话未结束、麦克风仍授权、未被用户手动暂停、且队员不在说话 → 继续听下一句 */
					if (micStream && currentCall && !currentCall.ended && !micPausedByUser && !ttsSpeaking) {
						try { recognition.start(); } catch { stopMic(); }
					} else {
						listening = false;
						syncMicButton();
					}
				};
				recognition.onerror = () => {
					listening = false;
					syncMicButton();
				};
				try {
					recognition.start();
					listening = true;
					/* 开启语音输入的瞬间：队员停止播报（把话语权交给队长） */
					stopSpeak();
					syncMicButton();
					showBubble("（已接通，请说话…）", true);
				} catch {
					listening = false;
					syncMicButton();
				}
			}

			/* 暂停聆听（保留麦克风授权与流），用于"队员说话时自动暂停"与"手动暂停" */
			function pauseListening() {
				listening = false;
				try { recognition?.stop(); } catch {}
				syncMicButton();
			}
			function resumeListening() {
				if (!micStream || !currentCall || currentCall.ended) return;
				micPausedByUser = false;
				startRecognition();
			}
			/* 队员播报期间自动暂停聆听 */
			function pauseListeningForTts() {
				if (listening) pauseListening();
			}
			function resumeListeningAfterTts() {
				if (!micPausedByUser && micStream && currentCall && !currentCall.ended && !listening && !ttsSpeaking) {
					startRecognition();
				}
			}

			function requestMic(reason) {
				/* 直接申请浏览器麦克风权限（不再弹插件确认框；浏览器首次会弹系统授权条，之后记住授权） */
				if (!navigator.mediaDevices?.getUserMedia) {
					showBubble("（当前浏览器无法访问麦克风，可打字回复）", true);
					typedFallback();
					return;
				}
				navigator.mediaDevices.getUserMedia({ audio: true })
					.then((stream) => {
						micStream = stream;
						micPausedByUser = false;
						startRecognition();
					})
					.catch((error) => {
						showBubble(`（麦克风不可用：${String(error?.message ?? error)}）`, true);
						typedFallback();
					});
			}

			function stopMic() {
				listening = false;
				micPausedByUser = false;
				try { recognition?.stop(); } catch {}
				try { micStream?.getTracks().forEach((track) => track.stop()); } catch {}
				micStream = null;
				recognition = null;
				syncMicButton();
			}

			function typedFallback() {
				if (!currentCall) return;
				/* 使用通话卡片底部常驻的输入框 */
				currentCall.inputRow.style.display = "flex";
				currentCall.input.focus();
			}

			/* ---------- 实时语音办公对话（真实队员 agent 回复：投递 → 等待其回信 → TTS 播报） ---------- */
			async function sendToMember(text) {
				const card = currentCall;
				if (!card) return;
				if (!card.workspace || !card.teamId || !card.member) {
					showBubble("（测试来电没有真实队员，无法语音对话；可等真实队员来电再试）", true);
					return;
				}
				showBubble(`你：${text}`, true);
				card.convHistory.push({ role: "user", content: text });
				const typing = el("div", { class: "dcc-wx-typing", text: "对方正在输入…（真实队员，约 30~90 秒）" });
				card.bubble.append(typing);
				card.bubble.scrollTop = card.bubble.scrollHeight;
				try {
					const response = await fetch("/plugins/dsh-captain-call/chat", {
						method: "POST",
						headers: { "content-type": "application/json" },
						body: JSON.stringify({ workspace: card.workspace, team: card.teamId, member: card.member, text }),
					});
					const data = await response.json();
					if (!data.ok) {
						typing.textContent = data.error === "captain session offline"
							? "（队长会话不在线，无法接通）"
							: `（发送失败：${data.error}）`;
						return;
					}
					let attempts = 0;
					const pollTimer = setInterval(async () => {
						attempts++;
						if (attempts > 120) {
							clearInterval(pollTimer);
							typing.textContent = "（对方暂时没有回应，请稍后再试）";
							return;
						}
						try {
							const rr = await fetch(`/plugins/dsh-captain-call/replies?workspace=${encodeURIComponent(card.workspace)}&team=${encodeURIComponent(card.teamId)}&member=${encodeURIComponent(card.member)}&after=${lastReplyTs}`);
							const rd = await rr.json();
							const fresh = (rd.replies ?? []).filter((reply) => typeof reply.ts === "number" && reply.ts > lastReplyTs);
							if (fresh.length) {
								clearInterval(pollTimer);
								typing.remove();
								const last = fresh[fresh.length - 1];
								lastReplyTs = last.ts;
								card.convHistory.push({ role: "assistant", content: last.content });
								showBubble(`${card.member}：${last.content}`, true);
								speak(last.content);
							}
						} catch {
							/* keep polling */
						}
					}, 2000);
				} catch {
					typing.remove();
					showBubble("（网络错误，发送失败）", true);
				}
			}

			/* ---------- 来电流程 ---------- */
			function showBubble(text, append) {
				if (!currentCall) return;
				const bubble = currentCall.bubble;
				if (append) {
					const line = el("div", { text });
					bubble.append(line);
				} else {
					bubble.replaceChildren(el("div", { text }));
				}
				bubble.style.display = "block";
				bubble.scrollTop = bubble.scrollHeight;
			}

			const PHONE_UP_SVG = `<svg viewBox="0 0 24 24" width="26" height="26" fill="#fff"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.61 21 3 13.39 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>`;
			const PHONE_DOWN_SVG = `<svg viewBox="0 0 24 24" width="26" height="26" fill="#fff"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.61 21 3 13.39 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" transform="rotate(135 12 12)"/></svg>`;

			/* ---------- 来电铃声：ayaho《チャイムの音で》（试听片段循环；失败回退合成提示音） ---------- */
			let ringCtx = null;
			let ringTimer = null;
			let ringAudio = null;
			function startRingFallback() {
				const AC = window.AudioContext || window.webkitAudioContext;
				if (!AC) return;
				try {
					ringCtx = ringCtx ?? new AC();
					if (ringCtx.state === "suspended") ringCtx.resume().catch(() => {});
					const gain = ringCtx.createGain();
					gain.gain.value = 0.16;
					gain.connect(ringCtx.destination);
					const beep = () => {
						const t = ringCtx.currentTime;
						for (const freq of [659.26, 783.99]) {
							const osc = ringCtx.createOscillator();
							const g = ringCtx.createGain();
							osc.type = "sine";
							osc.frequency.value = freq;
							g.gain.setValueAtTime(0, t);
							g.gain.linearRampToValueAtTime(1, t + 0.02);
							g.gain.setValueAtTime(1, t + 0.42);
							g.gain.linearRampToValueAtTime(0, t + 0.46);
							osc.connect(g);
							g.connect(gain);
							osc.start(t);
							osc.stop(t + 0.46);
						}
					};
					beep();
					clearInterval(ringTimer);
					ringTimer = setInterval(beep, 1900);
				} catch {}
			}
			let ringPlaying = false;
			function showRingBtn() {
				if (currentCall?.ringBtn) currentCall.ringBtn.style.display = "block";
			}
			function hideRingBtn() {
				if (currentCall?.ringBtn) currentCall.ringBtn.style.display = "none";
			}
			function startRing(fromGesture) {
				if (muted) return;
				try {
					const audio = new Audio(`${ASSET_URL}/ringtone.m4a`);
					audio.loop = true;
					audio.volume = 1.0;
					ringAudio = audio;
					audio.onplaying = () => { ringPlaying = true; hideRingBtn(); };
					const promise = audio.play();
					if (promise && typeof promise.then === "function") {
						promise.then(() => { ringPlaying = true; hideRingBtn(); }).catch(() => {
							ringAudio = null;
							ringPlaying = false;
							if (fromGesture) startRingFallback(); else showRingBtn();
						});
					}
				} catch {
					ringPlaying = false;
					if (fromGesture) startRingFallback(); else showRingBtn();
				}
			}
			function stopRing() {
				ringPlaying = false;
				hideRingBtn();
				try { ringAudio?.pause(); } catch {}
				ringAudio = null;
				clearInterval(ringTimer);
				ringTimer = null;
				try { ringCtx?.close(); } catch {}
				ringCtx = null;
			}

			function buildCallCard(data) {
				const mask = el("div", { class: "dcc-wx-mask" });
				const blur = el("div", { class: "dcc-wx-blur" });
				blur.style.backgroundImage = `url(${ASSET_URL}/${data.avatar || cfg?.fallbackAvatar || "placeholder.svg"})`;
				const card = el("div", { class: "dcc-wx-card" });
				const avatar = el("img", { class: "dcc-wx-avatar", src: ASSET_URL + "/" + (data.avatar || cfg?.fallbackAvatar || "placeholder.svg"), alt: data.caller });
				const name = el("div", { class: "dcc-wx-name", text: data.caller });
				const sub = el("div", { class: "dcc-wx-sub" });
				sub.append(
					el("span", { class: "dcc-wx-bell", text: "🔔" }),
					el("span", { text: ` 邀请你进行语音通话…（${data.team} · ${data.task?.subject ?? "-"}）` })
				);
				const bubble = el("div", { class: "dcc-wx-bubble" });
				const ringBtn = el("button", { class: "dcc-wx-ringbtn", text: "🔔 点击开启铃声" });
				ringBtn.style.display = "none";
				const actions = el("div", { class: "dcc-wx-actions" });
				const decline = el("button", { class: "dcc-wx-btn decline", title: "拒绝", html: PHONE_DOWN_SVG });
				const cancel = el("button", { class: "dcc-wx-btn decline", title: "取消", html: PHONE_DOWN_SVG });
				cancel.style.display = "none";
				const accept = el("button", { class: "dcc-wx-btn accept", title: "接听", html: PHONE_UP_SVG });
				actions.append(decline, cancel, accept);
				const toolrow = el("div", { class: "dcc-wx-toolrow" });
				const voiceReply = el("button", { text: "🎤 语音回复" });
				const micPause = el("button", { text: "⏸️ 暂停聆听" });
				micPause.style.display = "none";
				micPause.addEventListener("click", () => {
					if (listening) {
						micPausedByUser = true;
						pauseListening();
					} else {
						resumeListening();
					}
				});
				const endCall = el("button", { text: "🔴 结束通话" });
				endCall.style.display = "none";
				toolrow.append(voiceReply, micPause, endCall);
				/* 常驻文字输入行（接听后显示）：打字提问/回复 */
				const inputRow = el("div", { class: "dcc-wx-inputrow" });
				const input = el("input", { type: "text", placeholder: "打字回复…（回车发送）" });
				const sendBtn = el("button", { text: "发送" });
				inputRow.append(input, sendBtn);
				const sendInput = () => {
					const text = input.value.trim();
					if (!text) return;
					input.value = "";
					sendToMember(text);
				};
				sendBtn.addEventListener("click", sendInput);
				input.addEventListener("keydown", (event) => {
					if (event.key === "Enter") sendInput();
				});
				card.append(avatar, name, sub, ringBtn, bubble, inputRow, actions, toolrow);
				mask.append(blur, card);
				return { mask, bubble, sub, ringBtn, accept, decline, cancel, voiceReply, micPause, endCall, inputRow, input, sendBtn };
			}

			/* ---------- 主动拨打：通讯录点击队员 → 微信式呼出 → 接通后自动问进度 ---------- */
			function outgoingCall(info) {
				let workspace, teamId, teamName;
				for (const team of lastTeams) {
					if ((team.members ?? []).some((m) => m.name === info.name)) {
						workspace = team.workspace;
						teamId = team.team;
						teamName = team.name;
						break;
					}
				}
				panel.classList.remove("open");
				const card = buildCallCard({
					caller: info.name,
					avatar: avatarFor(info.name),
					team: teamName ?? "（通讯录）",
					task: { id: "outgoing", subject: "进度查询", status: "completed", createdAt: Date.now(), updatedAt: Date.now() },
				});
				card.workspace = workspace;
				card.teamId = teamId;
				card.member = info.name;
				card.ended = false;
				card.convHistory = [];
				currentCall = card;
				card.accept.style.display = "none";
				card.decline.style.display = "none";
				card.cancel.style.display = "";
				card.sub.replaceChildren(el("span", { class: "dcc-wx-bell", text: "📶" }), el("span", { text: " 正在呼叫…" }));
				root.append(card.mask);
				card.mask.classList.add("open");
				let ended = false;
				const pushLog = (text) => {
					history.push({ time: new Date().toLocaleTimeString("zh-CN", { hour12: false }), who: info.name, text });
					saveJSON(HISTORY_KEY, history.slice(-200));
					renderLog();
					badge.textContent = String(history.length);
					badge.style.display = history.length ? "block" : "none";
				};
				pushLog("呼出 · 查进度");
				const end = () => {
					if (ended) return;
					ended = true;
					card.ended = true;
					stopRing();
					try { stopSpeak(); } catch {}
					stopMic();
					document.removeEventListener("pointerdown", card.retryOnce, true);
					card.mask.remove();
					if (currentCall === card) currentCall = null;
				};
				card.cancel.addEventListener("click", () => {
					pushLog("呼出 · 已取消");
					end();
				});
				card.endCall.addEventListener("click", end);
				card.voiceReply.addEventListener("click", () => requestMic("和这位队员进行实时语音办公对话"));
				card.retryOnce = () => {};
				document.addEventListener("pointerdown", card.retryOnce, true);
				startRing(false); /* 拨号音（点击发起 = 已有用户手势） */
				setTimeout(() => {
					if (ended) return;
					stopRing();
					card.cancel.style.display = "none";
					card.endCall.style.display = "";
					card.sub.replaceChildren(el("span", { text: "语音通话中…" }));
					card.inputRow.style.display = "flex";
					showBubble(`${info.name} 已接听`, false);
					pushLog("已接听 · 自动问进度");
					/* 自动开场：以队长身份查进度，队员人设依据任务状态回答 */
					sendToMember(`你好，我是Daisy队长，请简短问好，然后跟我汇报一下你手头任务的进度。`);
				}, 2500);
			}

			function timingText(task) {
				const minutes = Math.max(1, Math.round(((task?.updatedAt ?? Date.now()) - (task?.createdAt ?? Date.now())) / 60000));
				if (task?.status === "failed") return fill(cfg?.timingFailed ?? "", { status: task.status, minutes });
				return fill(cfg?.timingOk ?? "", { minutes });
			}

			function incomingCall(data, isTest = false) {
				const caller = data.caller ?? data.task?.assignee ?? "队员";
				const card = buildCallCard({ ...data, caller });
				/* 语音桥上下文：workspace/teamId/member 用于把语音转文字投递给真实成员 agent */
				card.workspace = data.workspace;
				card.teamId = data.teamId;
				card.member = caller;
				card.ended = false;
				card.convHistory = [];
				currentCall = card;
				root.append(card.mask);
				card.mask.classList.add("open");
				showBubble(fill(cfg?.ringText ?? "", { member: caller }));
				let ringing = true;
				let ended = false;
				/* 来电即记账：来电记录实时更新 */
				const pushLog = (text) => {
					history.push({ time: new Date().toLocaleTimeString("zh-CN", { hour12: false }), who: caller, text });
					saveJSON(HISTORY_KEY, history.slice(-200));
					renderLog();
					badge.textContent = String(history.length);
					badge.style.display = history.length ? "block" : "none";
				};
				pushLog(`来电 · 任务《${data.task?.subject ?? "-"}》`);

				const greetingText = () =>
					fill(cfg?.greeting ?? "", {
						bossName: cfg?.bossName ?? "Daisy",
						bossTitle: cfg?.bossTitle ?? "队长",
						member: caller,
						subject: data.task?.subject ?? "-",
						timing: timingText(data.task),
					});

				const answer = () => {
					if (ended) return;
					ringing = false;
					stopRing();
					card.accept.style.display = "none";
					card.decline.style.display = "none";
					card.endCall.style.display = "";
					card.sub.replaceChildren(el("span", { text: "语音通话中…（点下方『语音回复』即可和队员实时对话）" }));
					card.inputRow.style.display = "flex";
					lastReplyTs = Date.now(); /* 只播报接听后新产生的回复 */
					const text = greetingText();
					showBubble(text);
					pushLog(`已接听 · 任务《${data.task?.subject ?? "-"}》${data.task?.status === "failed" ? "失败" : "完成"}`);
					speak(text); /* 点击接听 = 用户手势，语音必响 */
					setTimeout(() => { if (!ended && currentCall === card) end(); }, 600000);
				};
				const end = () => {
					if (ended) return;
					ended = true;
					card.ended = true;
					ringing = false;
					stopRing();
					try { stopSpeak(); } catch {}
					stopMic();
					document.removeEventListener("pointerdown", card.retryOnce, true);
					card.mask.remove();
					if (currentCall === card) currentCall = null;
				};
				card.accept.addEventListener("click", answer);
				card.decline.addEventListener("click", () => {
					pushLog("已拒绝");
					end();
				});
				card.endCall.addEventListener("click", end);
				card.ringBtn.addEventListener("click", () => {
					if (!ringing || ended) return;
					stopRing();
					startRing(true); /* 点击 = 用户手势，铃声必响 */
				});
				card.voiceReply.addEventListener("click", () => requestMic("和这位队员进行实时语音办公对话"));
				/* 浏览器自动播放策略：任何一次点击都会解锁音频；来电期间用户的任意点击补响铃声 */
				card.retryOnce = () => {
					if (!ringing || ended) return;
					if (!ringPlaying) {
						stopRing();
						startRing(true);
					}
				};
				document.addEventListener("pointerdown", card.retryOnce, true);
				startRing(false);
			}

			/* ---------- 轮询任务状态 ---------- */
			const avatarFor = (memberName) => cfg?.avatarMap?.[memberName] || cfg?.fallbackAvatar || "placeholder.svg";

			function handleTeams(teams) {
				lastTeams = teams;
				renderContacts();
				for (const team of teams) {
					for (const task of team.tasks) {
						if (task.status !== "completed" && task.status !== "failed") continue;
						const key = `${team.workspace}|${team.team}|${task.id}|${task.status}`;
						if (baselineDone) {
							if (seen.has(key)) continue;
							seen.add(key);
							persistSeen();
							const member = (team.members ?? []).find((m) => m.name === task.assignee);
							incomingCall({
								workspace: team.workspace,
								teamId: team.team,
								team: team.name ?? team.team,
								task,
								caller: task.assignee,
								avatar: avatarFor(task.assignee),
								memberRole: member?.role,
							});
						} else {
							seen.add(key);
						}
					}
				}
				if (!baselineDone) {
					baselineDone = true;
					persistSeen();
				}
			}

			async function poll() {
				try {
					const response = await fetch(STATE_URL, { cache: "no-store" });
					if (!response.ok) return;
					const data = await response.json();
					cfg = data.config ?? cfg;
					if (data.voices) voiceCatalog = data.voices;
					bossImg.src = ASSET_URL + "/" + (data.config?.bossAvatar ?? "ginka.png");
					handleTeams(data.teams ?? []);
				} catch {
					/* network hiccup: keep polling */
				}
			}

			poll();
			const timer = setInterval(poll, Number(cfg?.pollMs ?? 4000));

			ctx.effect(() => () => {
				clearInterval(timer);
				if (autoAnswerTimer) clearTimeout(autoAnswerTimer);
				try { stopSpeak(); } catch {}
				stopRing();
				stopMic();
				style.remove();
				root.remove();
			}, "captain-call: desktop assistant");
		}

		exports.apply = apply;
		return module.exports;
	}
});
