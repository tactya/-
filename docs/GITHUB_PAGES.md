# GitHub Pages 部署

1. Fork 本仓库，或通过 Use this template 创建自己的副本。
2. 在自己的仓库打开 Actions。若 GitHub 提示工作流未启用，先启用。
3. 打开 Settings → Pages，在 Build and deployment 的 Source 中选择 GitHub Actions。
4. 打开 Actions → Validate and deploy Pages → Run workflow，选择主分支并运行。
5. 等待构建和部署都变绿。在部署任务或 Settings → Pages 中打开实际生成的网址。

以后向 main 分支提交故事修改会自动重新部署。其他默认分支可手动运行工作流，或相应修改工作流的 branches。

默认构建 stories/template/story.json。要使用自己的作品，直接修改它；也可以在工作流 build 任务中设置 STORY_FILE 为你的脚本路径。

页面可以部署在仓库子路径下，不需要购买域名或使用真实账号登录。不要用 file:// 打开。刷新后资源应仍正常加载；第一次访问需要联网，缓存完成后核心剧情可以离线游玩。

如果构建失败，先看 Actions 中第一个红色步骤；故事错误会显示文件、行号和字段。确认 npm run story:validate、npm run story:test、npm run build 均通过后再提交。

本教程不会替你创建仓库、推送或发布；这些操作需要仓库所有者明确授权。
