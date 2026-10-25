# 0.7.0 — 空白默认手机与用户实机参考

默认不加载剧情；旧样例仅用于测试。按用户14张真实截图校准设置、微信和控制中心；系统版本不限定iOS18。私人截图不公开打包，既有引擎、存档及编辑版备份保留。

# 0.6.0 — AI script framework

先备份并验证0.5编辑版，再在ai-script-framework分支增量改造。新增脚本工具链、标准AI文档、双结局示例、无编辑器静态入口、PWA离线测试、系统设计参数、设置导航和独立详情页。保留47App和既有引擎。全App逐页视觉验收未完成。

# Changelog

## 0.1.0 — 2026-10-24

Initial development preview: local phone shell, 47 app templates using shared engine views, creator editing, IndexedDB drafts, player state isolation, branching story execution, React Flow, chat import, media, rich text, JSON/ZIP/static export, PWA shell, MIT documentation and automated tests. Full requirements are not yet complete; see docs/PROGRESS.md.

## 0.2.0 — 2026-10-24

Renamed Chinese UI to 捡手机. Reduced Studio copy and switched the host workspace to monochrome system styling. Added optional app library and a legacy-compatible installed flag distinct from home visibility, uninstall data choice, reinstall, pointer ordering, folders and custom icons. New projects start with six system apps and no sample story. Added independent WeChat, WhatsApp and Instagram layouts and navigation over the existing runtime. Existing story/save/export functionality retained. Full independent UI coverage for the remaining 44 apps is still pending.

## 0.3.0 — 2026-10-24

Extended independent primary UI coverage to all47 apps; added bounded app metadata editors, persisted player selections/audio progress, chronological delay scheduling, time/variable cascades and simulated call branches. Lazy-loaded rich editing and grouped app skins. Existing install lifecycle, author drafts and exports preserved. Full platform fidelity and real-device validation remain pending.

## 0.4.0 — 2026-10-24

iOS18 visual calibration: fixed logical device coordinate space, paged home screen, redrawn app artwork, glass surfaces and system navigation, WeChat chat/list spacing. Preserved runtime and app installation data. This is not pixel-identical official product reproduction.

## 0.5.0 — 2026-10-25

Reviewed five iOS web simulators and adapted attributed MIT launcher/Dock, unlock and control modules. Added staged lock/passcode,393×852 device metrics, gestures, notification stack/banner, keyboard drafts and grouped settings. Retained existing engines, app installation lifecycle and exports. Fixed dev lazy import initialization. Full platform fidelity remains incomplete.
