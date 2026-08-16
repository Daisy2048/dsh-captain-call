# dsh-captain-call · 队长来电（微信语音通话风格）

DeepSeek Harness Web GUI 插件：AgentTeams 队员完成任务时，桌面助手 **GINKA** 用**微信语音通话风格的来电界面**呼叫 Daisy 队长，语音汇报"**是谁**、**是否按要求准时完成**"。

## 特性

- 📞 **微信式来电 UI**：全屏模糊头像背景 + 白色卡片 + 来电人姓名 + "🔔 邀请你进行语音通话…"，绿色**接听** / 红色**拒绝**圆形按钮（微信配色 #07C160 / #FA5151）；头像头部优先展示（`object-position: 50% 12%`，不裁头）
- 🔔 **必响铃声**：来电即自动尝试播放 ayaho《チャイムの音で》试听循环；若被浏览器自动播放策略拦截，卡片出现「🔔 点击开启铃声」按钮（点击必响）；来电期间**任意一次点击**也会自动补响铃声；音频异常时回退 Web Audio 合成提示音
- 📵 **手动接听**：接听必须点击绿色按钮（点击手势保证 TTS 语音 100% 播放），无自动接听
- 🎙️ **开源语音引擎**：播报优先用 **Kokoro-82M-zh**（[hexgrad/kokoro](https://github.com/hexgrad/kokoro)，Apache 许可，82M 参数，本地 ONNX 直跑，离线可用，中文男女声 zf_*/zm_* 共百余款）；模型未就绪/合成失败时自动兜底 **msedge-tts**（微软神经语音，Xiaoxiao 女声/Yunxi 男声），再兜底浏览器系统语音。当前引擎状态可在 `/plugins/dsh-captain-call/state` 的 `tts.engine` 查看（kokoro/edge/loading）。模型文件随插件分发于 `models/`（约 175MB，含声码器备用），音色映射见配置 `voiceMapJson`/`voiceMapEdgeJson`
- 🗣️ **语音播报**：接听后 TTS（中文）播报「Daisy 队长你好！我是{成员}。向你汇报：任务《{subject}》已完成。按要求准时完成，用时约 N 分钟。请验收。」——内容、称谓、话术全部可配置
- 🎤 **麦克风先问后取**：每次申请麦克风（语音回复）前，先弹出「ginka 想使用麦克风……是否允许？」确认框，队长点击"允许"后才调用 `getUserMedia`；语音识别不支持时自动降级为打字回复
- 🐋 **桌面助手挂件**：右下角 GINKA 头像（呼吸浮动动画），点击展开面板：**👥 通讯录**（点击队员即可主动拨打）、测试来电、静音开关、最近 20 条来电历史（localStorage 持久化）
- 📤 **双向通话**：不仅队员完成任务会来电；队长随时点通讯录**呼出**（微信式"正在呼叫…"→ 对方接听 → 自动开场问进度），双向语音办公对话
- ⚡ **快速语音对话**：接听后点「🎤 语音回复」授权麦克风即可说话——语音转文字后用**队员人设 + 其真实任务状态**秒回（几秒内），完整对话**后台存档**给真实队员 agent；语音识别不支持时自动降级打字对话
- ⏱️ **准时汇报**：根据 `team.json` 的 createdAt→updatedAt 计算用时；任务失败时播报失败状态
- 🔁 **去重与基线**：首次加载把历史已完成任务标记为基线（不回放旧来电）；运行期间新完成的任务才会触发来电；记录持久化，重启不重复来电
- 🧹 **可卸载即复原**：所有 DOM/CSS/定时器/音频/麦克风流在 effect 销毁器中全部回收

## 角色头像（默认映射）

| 谁 | 头像 | 文件 |
|---|---|---|
| 老板 Daisy | GINKA | `assets/ginka.png` |
| 制导方案研究员 | 比企谷八幡（大老师） | `assets/hachiman.png` |
| 开源复现工程师 | 折木奉太郎 | `assets/oreki.png` |
| 机载视觉可行性研究员 | 程小时 | `assets/chengxiaoshi.png` |
| 学习计划整理师 | 陆光 | `assets/luguang.png` |
| 未匹配成员 | 占位图 | `assets/placeholder.svg` |

映射与话术均可在 `cordis.patch.yml` 配置覆盖（见下）。

## 安装

```sh
git clone https://github.com/Daisy2048/dsh-captain-call.git
cd dsh-captain-call
./scripts/download-models.ps1        # 恢复 Kokoro 中文语音模型（约 127MB，不随 git 提交）
dsh plugin --profile web add .
# 重启 dsh web 后刷新页面即生效
dsh web
```

卸载：

```sh
dsh plugin --profile web remove @dsh-external/dsh-client-ui-captain-call
```

## 参与开发

- 仓库地址：https://github.com/Daisy2048/dsh-captain-call
- 开发循环、仓库结构、待办清单（快速对话修复、开源 ASR、音色选择器等）见 [CONTRIBUTING.md](./CONTRIBUTING.md)
- 素材与模型恢复脚本：`scripts/download-assets.ps1`、`scripts/download-models.ps1`
- 版权声明见 [NOTICE.md](./NOTICE.md)，上线可行性见 [上线可行性报告.md](./上线可行性报告.md)

## 配置（cordis.patch.yml 可覆盖）

```yaml
- id: ui-captain-call
  config:
    bossName: Daisy          # 队长名字
    bossTitle: 队长           # 称呼后缀
    pollMs: 4000             # 状态轮询周期
    speechRate: 1.0          # 播报语速
    greeting: '{bossName}{bossTitle}你好！我是{member}。向你汇报：任务《{subject}》已完成。{timing}请验收。'
    timingOk: '按要求准时完成，用时约 {minutes} 分钟。'
    timingFailed: '很抱歉，任务没有按要求完成，当前状态是 {status}。'
    ringText: '{member} 来电…'
    bossAvatar: ginka.png
    fallbackAvatar: placeholder.svg
    avatarMapJson: '{"制导方案研究员":"hachiman.png","开源复现工程师":"oreki.png","机载视觉可行性研究员":"chengxiaoshi.png","学习计划整理师":"luguang.png"}'
```

## 工作原理

```
AgentTeams 磁盘状态 (.agent-teams/<team>/team.json)
        │  host 插件读取（lib/index.js）
        ▼
/plugins/dsh-captain-call/state（JSON：配置 + 各工作区团队任务）
        │  客户端轮询（lib/client.js，默认 4s）
        ▼
任务 status 新变为 completed/failed
        ▼
微信式来电 → 铃声 → TTS 播报「Daisy队长你好！我是…」
```

## 边界与注意事项

- 通知基于**磁盘状态轮询**（与 AgentTeams 官方活动面板同一数据源），不做 Cordis 事件注入，不触达模型请求；
- 浏览器自动播放策略可能拦截无手势的铃声/TTS：页面上任何一次点击后即恢复；来电卡片也提供"接听"按钮作为手势入口；
- 语音识别（SpeechRecognition）仅 Chromium 系浏览器支持，其他浏览器自动降级为打字回复；
- 首次加载会把历史已完成任务标记为基线，**不会**回放旧来电。

## 许可

- 代码：MIT（见 `LICENSE`）
- 头像与铃声素材：版权归原作者所有，**仅限个人本地使用**，公开发布前必须替换为自有/授权素材——详见 `NOTICE.md` 与 `上线可行性报告.md`。
