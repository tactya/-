# Architecture

正式入口 index.html → src/runtime/StoryPlayer.tsx → Phone。构建只包含玩家入口，不暴露可视化创作器。原有作者模块保留兼容，但不进入正式依赖图。

stories/template/story.json 是可替换的中性演示；stories/blank/story.json 是纯空白起点。scripts/story.mjs 通过 src/story-engine/compiler.ts 编译为 Work v1，校验稳定 ID、引用、安全素材和剧情图。testStory.ts 重放测试路径，检查密码、隐藏内容和结局。

src/engine.ts 是纯状态转移引擎。Work 在游玩中保持不可变，Runtime 保存玩家进度、事件、来电、通知和选择。src/persistence.ts 使用 IndexedDB，作者数据与玩家存档分表存储。

src/registry.ts 注册 App；Phone、AppSkins、skins 与 src/apps 等现有组件负责页面呈现。桌面安装状态与布局由现有 App 管理和 launcher 模块处理。App 注册数量不代表每个 App 的全部原生页面均已完成。

正式构建生成 dist/，使用相对资源路径，支持静态托管。图标资源随源码保存在 assets/app-icons，正式构建自动打包，Fork 后无需另行下载。正式构建同时生成 work.json 与 test-work.json，默认模板使用完整 App 测试配置；纯空白作品独立保留。纯空白入口为 ?template=blank。

作者媒体采用经过校验的内嵌数据，不执行任意 HTML 或脚本。大型媒体和大作品会增加 JSON、内存与快照开销，尚未针对超大作品优化。许可与版权通知保留在源文件和分发文件中。
