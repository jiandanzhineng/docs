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
