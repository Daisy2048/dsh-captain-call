# 贡献指南 · dsh-captain-call（队长来电）

欢迎一起做！这是 DSH Web GUI 的 AgentTeams 语音通话插件：队员完成任务来电、通讯录主动拨打、微信式通话界面、真实队员语音对话、Kokoro 开源语音合成。

## 快速上手

```powershell
# 1. 安装到你的 DSH web profile（本地路径）
dsh plugin --profile web add <本仓库路径>

# 2. 恢复语音模型（约 127MB，不随 git 提交）
./scripts/download-models.ps1

# 3. 重启 dsh web 并刷新页面
dsh web
```

依赖（transformers.js / onnxruntime / msedge-tts）由 pnpm 在 `dsh plugin add` 时装入 profile；本仓库 node_modules 不提交。

## 仓库结构

```
dsh-captain-call/
├── lib/
│   ├── index.js      # 服务端：状态/资产路由、语音桥（chat/replies）、TTS 引擎
│   └── client.js     # 浏览器端：桌面助手、微信式来电、麦克风授权、对话循环
├── assets/           # 头像 + 铃声（见 NOTICE.md 版权声明）
├── models/           # 不提交；由 scripts/download-models.ps1 生成
├── scripts/          # 模型/素材恢复脚本
├── cordis.patch.yml  # bundle patch：插入 ui-captain-call 插件行
└── package.json      # dsh.bundle.patch + dsh.client 声明 + 依赖
```

## 开发循环

1. 改 `lib/index.js`（服务端）→ 重启 `dsh web` 生效；
2. 改 `lib/client.js`（浏览器端）→ 重启 `dsh web` + 刷新页面生效；
3. 快速自测服务端路由（无需浏览器）：
   ```powershell
   curl.exe http://127.0.0.1:3080/plugins/dsh-captain-call/state            # 状态 + tts.engine
   curl.exe "http://127.0.0.1:3080/plugins/dsh-captain-call/tts?text=你好&speaker=zf_001" -o t.wav   # 语音合成
   ```
4. 端到端验收：GINKA 面板「测试来电」→ 接听 → 语音回复/打字；
5. **Kokoro 引擎自测**（无需重启服务，直接验证模型/依赖是否完好）：
   ```powershell
   node scripts/selftest-kokoro.mjs   # 输出 SELFTEST OK 即引擎正常
   ```

## 约定

- 客户端是纯 DOM + 原生 JS（无 React），所有 DOM/CSS/定时器/音频/麦克风流必须在 `ctx.effect` 销毁器中回收（可卸载即复原）；
- 服务端只读 `.agent-teams/*/team.json`，禁止修改 AgentTeams 状态文件；
- 麦克风权限：点「语音回复」直接 `getUserMedia`，不弹插件确认框（浏览器首次系统授权条是安全机制，无法绕过）；
- **声线风格标注**：Kokoro 官方未公开"编号↔名称"对照表，试听确认后请把特征填入 `scripts/voice-traits.json`（格式 `"zf_001": "温柔女声"`），无需改代码；
- 素材版权：`assets/` 与 `models/` 均不入发布包，详见 `NOTICE.md` 与 `上线可行性报告.md`。

## 待办（欢迎认领）

- [ ] **快速对话（秒回）修复**：`ctx.llm.stream` 直调与 DSH 流校验中间件不兼容（报错 `Cannot read properties of undefined (reading 'kind')`）。正确做法参考 `@deepseek-ai/dsh-agent-loop/lib/index.js` 的 `preparedCall.stream(request)` 组装方式；修好后 `lib/client.js` 的 `sendToMember` 可切回 `/chat-fast` 秒回通道。
- [ ] **开源 ASR**：接入 FunASR / sherpa-onnx 替换浏览器 SpeechRecognition（当前仅 Chromium 支持）。
- [ ] **音色选择器**：通讯录面板加音色试听/选择 UI（Kokoro 有 102 款中文音色）。
- [ ] **来电免打扰时段**：配置静音时段、勿扰模式。
- [ ] **通话记录导出**：来电/通话历史导出 Markdown/JSON。
- [ ] **多团队支持完善**：跨工作区通讯录分组显示。
- [ ] **国际化**：界面文案 i18n。
- [ ] **素材合规化**：替换 assets/ 为 CC0/自绘素材，解锁公开发布。

## 提交规范

`feat: / fix: / docs: / perf: / chore:` 前缀，小步提交；改完在 README 特性区更新说明。
