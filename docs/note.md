# 开发备忘

记忆规则见 `E:\smart\AGENTS.md`。用户要求见 [adr/INDEX.md](adr/INDEX.md)。

## 站点与构建

- 网页文档源目录：`content/`（Docusaurus `docs.path`）；站点 URL 仍是 `/docs/`（`routeBasePath` 未改）。
- 项目备忘目录：`docs/`（`docs/adr`、`docs/note.md`），不要把备忘写进 `content/`。
- 提交前链接检查：`npm run check:doc-links`。
- 中文构建检查：`npm run build -- --locale zh-Hans`。
- 中文构建后本地预览：`npm run serve -- --dir build --host 127.0.0.1 --port 4517 --no-open`；端口占用就换空闲端口。
- 部署链路：push 到 `main` → GitHub Actions → 构建产物同时发 GitHub Pages 和阿里云 OSS `ezs-docs`。

## 部署与缓存

- **CDN 会把 HTML 缓存 24 小时**（`Cache-Control: max-age=86400`，`X-Swift-CacheTime: 86400`），仓库里没有自动刷新配置。CSS/JS 是内容哈希文件名，不受影响。
- 刷新 ESA 缓存：`node tool/purge-cdn-cache.js`（看剩余配额加 `--quota`），约 1 分钟生效。
- ESA 站点是整个 `undersilicon.cn` 区域，**只用目录刷新**把作用域限定在 docs 域名下；`hostname` 刷新当前套餐配额为 0 用不了，`purgeall` 会连 `shop.undersilicon.cn` 一起清，别用。
- 凭据取 `ALIYUN_ACCESS_KEY_ID/SECRET`，没设就回退读 `E:\smart\.env` 里的 `OSS_*`。

## 页面与内容

- 浅色主题背景：Infima 默认 `--ifm-background-color: transparent`，靠浏览器白画布兜底，在小程序 web-view 这类非白底容器里会黑底黑字。`src/css/custom.css` 的 `:root` 已显式补 `#fff`（2026-09-15）；改配色时两个主题都要给实色。
- 目录与网址对应：`content/start/`（快速开始）、`content/player/{寸止,提肛与踮脚,其他玩法,old}/`、`content/device/寸止综合设备/`（含组装页 `/device/cunzhi01/assembly`）。目录名不影响网址，网址只由 slug 决定。动目录前先在主干全语言构建出基线，运行 `python tool/route-anchors.py <基线build> tmp/baseline/routes.json`。改完后运行 `python tool/compare-routes.py <新build>`，不能有消失的网址或锚点。
- 中文页之间的链接一律写 `/docs/...` 绝对路径（按 slug 解析，换目录不会断）。非中文副本保留相对路径。
- 气压突变寸止教程：`content/player/寸止/气压突变寸止玩法说明.md`，路由 `/docs/player/surge-edging`；参数与流程核对来源 `E:\smart\project\control-panel\play-registry\games\surge-edging\index.html` 和 `game.js`（版本 1.1.2）。
- 喝水玩法源 `content/player/喝水液体收集解锁玩法.md`，slug 仍是 `/player/drink-pee-unlock`。
- 喝水教程购买入口：套装 `force-drink`、电子秤 `electronic-scale`、寸止主机 `cunzhi01-host`、自动锁 `zidongsuo-auto-lock`。
- 喝水英文页：`i18n/en/.../player/喝水液体收集解锁玩法.md`，流程图 `img/drink-pee-unlock-flow.svg`，买链 `https://shop.undersilicon.cn/en/products/force-drink`。
- 英文流程图文件名：`kegel-training-flow-en.svg`、`pushup-game-flow-en.svg`、`tiptoe-punish-flow.svg`、`cunzhi3phase-en.svg`；接口图、左右震动型、穿戴裤、踮脚海报、扇贝海报已换英文，只改 `i18n/en` 副本。配网和刷机截图仍是中文客户端界面，AI 重绘会改按钮，先不替换。

## 百度统计

- `docs.undersilicon.cn` siteId `23498178`，hm `ce732a9c35d7f2fe102617da8624c24c`。
- `docs.undersilicon.com` siteId `23498203`，hm `fcf301b9471d2e30b0362f85d770b3d0`。

## 其他

- 排查小程序 web-view 里页面的实际渲染，用开发者工具的 CDP 端口最直接，见 `E:\smart\project\shop\docs\note.md` 的「小程序商品描述链接」一节。
