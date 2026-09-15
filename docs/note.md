# 开发备忘

- 网页文档源目录：`content/`（Docusaurus `docs.path`）
- 站点 URL 仍为 `/docs/`（`routeBasePath` 未改）
- 项目备忘目录：`docs/`（`docs/adr`、`docs/draft`、`docs/note.md`）
- 链接检查：`npm run check:doc-links`
- 中文构建检查：`npm run build -- --locale zh-Hans`
- 中文构建后本地预览：`npm run serve -- --dir build --host 127.0.0.1 --port 4517 --no-open`；若端口占用需换空闲端口。
- 气压突变寸止教程：`content/player/气压突变寸止玩法说明.md`，路由 `/docs/player/surge-edging`；参数与流程核对来源为 `E:\smart\project\control-panel\play-registry\games\surge-edging\index.html` 和 `game.js`（2026-09-05，版本1.1.2）。
- 百度统计（账号 ysy1997212，2026-09-04 接入）
  - `docs.undersilicon.cn` siteId `23498178` hm `ce732a9c35d7f2fe102617da8624c24c`
  - `docs.undersilicon.com` siteId `23498203` hm `fcf301b9471d2e30b0362f85d770b3d0`
- 浅色主题背景：Infima 默认 `--ifm-background-color: transparent`，靠浏览器白色画布兜底，
  所以在小程序 web-view 这类底色不是白的容器里会变成黑底黑字。`src/css/custom.css` 的 `:root`
  里已显式补 `#fff`（2026-09-15）。改配色时记得两个主题都要给实色。
- 部署链路：push 到 `main` → GitHub Actions → 构建产物同时发 GitHub Pages 和阿里云 OSS `ezs-docs`。
- **CDN 会把 HTML 缓存 24 小时**（`Cache-Control: max-age=86400`，`X-Swift-CacheTime: 86400`），
  仓库里没有自动刷新配置。改完要立刻生效得去阿里云控制台刷新 URL/目录，否则最多等一天。
  CSS/JS 是内容哈希文件名，不受影响；受影响的是 HTML 本身。
- 排查小程序 web-view 里页面的实际渲染，用开发者工具的 CDP 端口最直接，见
  `E:\smart\project\shop\docs\note.md` 的「小程序商品描述链接」一节。
