# 开发备忘

- 网页文档源目录：`content/`（Docusaurus `docs.path`）
- 站点 URL 仍为 `/docs/`（`routeBasePath` 未改）
- 项目备忘目录：`docs/`（`docs/adr`、`docs/draft`、`docs/note.md`）
- 链接检查：`npm run check:doc-links`
- 中文构建检查：`npm run build -- --locale zh-Hans`
- 中文构建后本地预览：`npm run serve -- --dir build --host 127.0.0.1 --port 4517 --no-open`；若端口占用需换空闲端口。
- 气压突变寸止教程：`content/player/气压突变寸止玩法说明.md`，路由 `/docs/player/surge-edging`；参数与流程核对来源为 `E:\smart\project\control-panel\play-registry\games\surge-edging\index.html` 和 `game.js`（2026-09-05，版本1.1.2）。
- 喝水玩法 pee 模式对外称「液体收集」（容器放秤上、秤变重），不要写憋尿/排尿/排泄。源 `content/player/喝水液体收集解锁玩法.md`，slug 仍是 `/player/drink-pee-unlock`（2026-09-20）。
- 喝水教程购买入口已加 Shop：套装 `force-drink`、电子秤 `electronic-scale`、寸止主机 `cunzhi01-host`、自动锁 `zidongsuo-auto-lock`（2026-09-20）。
- 喝水玩法英文页：`i18n/en/.../player/喝水液体收集解锁玩法.md`，流程图英文 SVG 同目录 `img/drink-pee-unlock-flow.svg`，买链 `https://shop.undersilicon.cn/en/products/force-drink`（2026-09-22）。
- 英文文档配图：流程图用同目录英文 SVG（`kegel-training-flow-en.svg`、`pushup-game-flow-en.svg`、`tiptoe-punish-flow.svg`、`cunzhi3phase-en.svg`）。接口图、左右震动型、穿戴裤、踮脚海报、扇贝海报已换成英文，只改 `i18n/en` 副本。配网和刷机截图仍是中文客户端界面，AI 重绘会改按钮，先不替换（2026-09-23）。
- 百度统计（账号 ysy1997212，2026-09-04 接入）
  - `docs.undersilicon.cn` siteId `23498178` hm `ce732a9c35d7f2fe102617da8624c24c`
  - `docs.undersilicon.com` siteId `23498203` hm `fcf301b9471d2e30b0362f85d770b3d0`
- 浅色主题背景：Infima 默认 `--ifm-background-color: transparent`，靠浏览器白色画布兜底，
  所以在小程序 web-view 这类底色不是白的容器里会变成黑底黑字。`src/css/custom.css` 的 `:root`
  里已显式补 `#fff`（2026-09-15）。改配色时记得两个主题都要给实色。
- 部署链路：push 到 `main` → GitHub Actions → 构建产物同时发 GitHub Pages 和阿里云 OSS `ezs-docs`。
- **CDN 会把 HTML 缓存 24 小时**（`Cache-Control: max-age=86400`，`X-Swift-CacheTime: 86400`），
  仓库里没有自动刷新配置。改完要立刻生效得手动刷，否则最多等一天。
  CSS/JS 是内容哈希文件名，不受影响；受影响的是 HTML 本身。
- 刷新 ESA 缓存：`node tool/purge-cdn-cache.js`（看剩余配额加 `--quota`），约 1 分钟生效。
  ESA 站点是整个 `undersilicon.cn` 区域，所以**只用目录刷新**把作用域限定在 docs 域名下：
  `hostname` 刷新当前套餐配额为 0 用不了，`purgeall` 会连 `shop.undersilicon.cn` 一起清、别用。
  凭据取 `ALIYUN_ACCESS_KEY_ID/SECRET`，没设就回退读 `E:\smart\.env` 里的 `OSS_*`。
- 排查小程序 web-view 里页面的实际渲染，用开发者工具的 CDP 端口最直接，见
  `E:\smart\project\shop\docs\note.md` 的「小程序商品描述链接」一节。
