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

## 翻译工具链

- `npm run translate` = `write-translations` → `check-doc-translations.js`（md）→ `translate-i18n-json-itemized.js`（JSON）→ `prune-orphan-translations.js`。
- **翻译 API 代理已失效**（2026-11-11）：`.env` 里 `OPENAI_BASE_URL=https://claude-proxy.shiroha.tech` DNS 解析不了，`requestTranslate` 全部 fetch failed。itemized 脚本失败时会把 zh-Hans 原文回退写进外语文件，所以失败输出要人工检查、补译后再提交。修好后换 `OPENAI_BASE_URL`/`OPENAI_API_KEY` 再跑。

## 页面与内容

- 浅色主题背景：Infima 默认 `--ifm-background-color: transparent`，靠浏览器白画布兜底，在小程序 web-view 这类非白底容器里会黑底黑字。`src/css/custom.css` 的 `:root` 已显式补 `#fff`（2026-09-15）；改配色时两个主题都要给实色。
- 目录与网址对应：`content/start/`（`index.md` 为「第一次使用」首页 `/start`；`客户端下载.md`、`连接设备/{怎么选,蓝牙直连,电脑热点,配网到家里WiFi/index}`、`安全须知/`）、`content/player/{寸止,提肛与踮脚,其他玩法,old}/`、`content/device/寸止综合设备/`（含组装页 `/device/cunzhi01/assembly`）。目录名不要带空格（链接检查脚本不 decode `%20`）。目录名不影响网址，网址只由 slug 决定。动目录前先在主干全语言构建出基线，运行 `python tool/route-anchors.py <基线build> tmp/baseline/routes.json`。改完后运行 `python tool/compare-routes.py <新build>`，不能有消失的网址或锚点。
- 中文页之间的链接一律写 `/docs/...` 绝对路径（按 slug 解析，换目录不会断）。非中文副本保留相对路径。
- 客户端下载合并为一页：`content/start/客户端下载.md`（原 `start/client/` 分类已撤掉），slug `/player/new-phone-client`（沿用原安卓页网址）。页内分 安卓/iOS/鸿蒙/PC 四节，锚点 `#安卓客户端` `#ios` `#鸿蒙客户端` `#pc`；PC 段含使用指南、无热点 mDNS 备用方式（锚点 `#无电脑热点情况使用方式`）。原 `/player/ios-client`、`/player/harmonyos-client`、`/pc-client` 三个网址已废弃（2026-11 用户确认这些页没做推广，可变）。i18n 各 locale 同步合并为同路径 `start/客户端下载.md`，配图在 `start/img/`。
- 气压突变寸止教程：`content/player/寸止/气压突变寸止玩法说明.md`，路由 `/docs/player/surge-edging`；参数与流程核对来源 `E:\smart\project\control-panel\play-registry\games\surge-edging\index.html` 和 `game.js`（版本 1.1.2）。
- 喝水玩法源 `content/player/喝水液体收集解锁玩法.md`，slug 仍是 `/player/drink-pee-unlock`。
- 喝水教程购买入口：套装 `force-drink`、电子秤 `electronic-scale`、寸止主机 `cunzhi01-host`、自动锁 `zidongsuo-auto-lock`。
- 喝水英文页：`i18n/en/.../player/喝水液体收集解锁玩法.md`，流程图 `img/drink-pee-unlock-flow.svg`，买链 `https://shop.undersilicon.cn/en/products/force-drink`。
- 英文流程图文件名：`kegel-training-flow-en.svg`、`pushup-game-flow-en.svg`、`tiptoe-punish-flow.svg`、`cunzhi3phase-en.svg`；接口图、左右震动型、穿戴裤、踮脚海报、扇贝海报已换英文，只改 `i18n/en` 副本。配网和刷机截图仍是中文客户端界面，AI 重绘会改按钮，先不替换。

## 商城互通（2026-11-11 起，详见 ADR 2026-11-11-shop-integration）

- 商品快照 `src/data/shop-products.json`（slug、中英文名、首图绝对网址，不含价格）：`npm run sync:shop-products` 联网拉 `shop.undersilicon.cn/api/products` 更新；CI 构建只用已提交快照。
- 中文源页 frontmatter 写 `products: [商品slug]`，插件 `src/plugins/shop-docs/` 按 doc id 让所有语言共用；未知 slug 构建时警告，`npm run check:shop-products` 校验（未知即退出 1）。
- 每个语言构建在输出根目录写 `product-docs.json`（中文 `build/`、英文 `build/en/`），字段：version/locale/generatedAt/onboarding（新手引导页 id 写在 `docusaurus.config.ts` 插件 options）/products（slug → {id,title,path} 数组）。
- 文档页卡片：`src/theme/DocItem/Footer` 包住原 footer，正文后渲染 `src/components/ShopProducts`；ref 为 `docs-<页面slug末段>`（商城只允许 `[A-Za-z0-9._-]{1,64}`）；小程序 web-view 里（UA 含 miniProgram 或 `__wxjs_environment`）按需加载 jweixin 调 `wx.miniProgram.navigateTo(/pages/product/index?slug=...)`。
- 商城链接带 `?ref=docs`（导航栏「商城」、页脚「官网商城」），中文站链 `/zh`、其他语言链 `/en`（`DOCUSAURUS_CURRENT_LOCALE` 判断）。

## 智能客服（瑰夏）与知识包

- KB 生成：`npm run build` 之后跑 `npm run build:kb`（`tool/build-kb.mjs`），输出 `build/kb/docs-kb.json`，随构建产物一起发到 GitHub Pages 和 OSS。线上地址：`https://ezs-docs.oss-cn-shanghai.aliyuncs.com/kb/docs-kb.json`。页数 < 20 或任一 url 缺失时非 0 退出让 CI 失败。
- 右下客服挂件：`src/theme/Root.tsx` + `src/components/AiKefuChat/`（智能客服/人工客服两个标签）。API 地址取 `customFields.kefuApiBase`（默认 `https://wxapi.undersilicon.cn`，本地联调用环境变量 `KEFU_API_BASE` 覆盖）。接口：`POST {base}/api/web/chat`，body `{sessionId, message, locale, page}`，返回 `{reply, handoff, sources}`，错误 `{error, message}`。sessionId 与最近 50 条记录存 localStorage。
- 挂件 UI 文案走 code.json i18n（id 统一 `kefu.*`，zh-Hans 为源）：新文案写成 `translate({id, message})` 字面量调用，`npm run write-translations` 提取后进 `i18n/zh-Hans/code.json`，再由 `tool/translate-i18n-json-itemized.js` 补 en/ja/es/de。注意该翻译器按 zh-Hans 重建目标文件——zh-Hans 没有的 key 会从外语文件里被丢掉，新 key 必须先进 zh-Hans（2026-11-11）。

## 百度统计

- `docs.undersilicon.cn` siteId `23498178`，hm `ce732a9c35d7f2fe102617da8624c24c`。
- `docs.undersilicon.com` siteId `23498203`，hm `fcf301b9471d2e30b0362f85d770b3d0`。

## 其他

- 排查小程序 web-view 里页面的实际渲染，用开发者工具的 CDP 端口最直接，见 `E:\smart\project\shop\docs\note.md` 的「小程序商品描述链接」一节。
