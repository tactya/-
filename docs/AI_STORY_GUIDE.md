# AI 创作指南

这是现成的交互式虚拟手机框架。通常只需要添加故事，不需要重新开发手机。

1. 先读 AGENTS.md、docs/STORY_SCHEMA.md，并检查 Git 状态。默认作品是 stories/template/story.json；stories/blank/story.json 是纯空白起点。
2. 将自然语言、人物设定、聊天和素材整理为结构化数据。使用稳定英文 ID 关联联系人、消息、照片、事件和 App。不要擅自添加重大剧情反转；关键设定缺失时向作者确认。
3. 优先只修改 stories/。复用现有 App、事件和数据字段，不为了剧情重写 React 页面或共享引擎。App ID 见 src/registry.ts。KakaoTalk 为 kakao，X 为 twitter。
4. 运行 npm run story:validate、npm run story:test、npm run build。每个结局提供可通过的测试路径；密码、隐藏内容、来电与跨 App 引用都应验证。
5. 运行 npm run story:preview，按显示的网址游玩。检查移动视口、刷新和存档。剧情变更时递增 revision，避免旧进度混入新作品。
6. 默认脚本可以直接替换。其他脚本使用 npm run story:validate -- stories/你的目录/story.json 校验；预览和正式构建通过 STORY_FILE 环境变量选择。
7. JSON 与包含一个 json 围栏的 Markdown 可以编译。自然语言必须先由 AI 转为数据；不支持直接执行 YAML、HTML、JavaScript 或外部代码。
8. 不导入私人账号、真实聊天或没有公开使用权的素材。不要把浏览器玩家存档当作者脚本。发布前确认授权，保留代码和依赖的许可通知；不自动执行 Fork、Star、Push 或发布。

常用数据：chats 使用 participants 与 senderId 关联联系人；read 事件响应消息阅读；callEnded 可解锁隐藏动态。Instagram 的 meta.story="true" 标记快拍，folder="私信" 标记私信。具体字段以版本化 Schema 和编译器为准。

正式默认模板为完整 App 测试预览，只有测试文字，没有内置剧情。正式构建也提供 ?preview=test。作者创作时可替换 stories/template/story.json，或从纯空白脚本开始。
