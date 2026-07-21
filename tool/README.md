# 翻译工具（tool/）

用大模型把中文文档（`docs/`）和 UI 文案（`i18n/`）翻译成 `en` / `ja` / `es` / `de`。
源语言固定为 `zh-Hans`（默认语言），翻译文件落在 `i18n/<locale>/docusaurus-plugin-content-docs/current/` 下，与源保持相同的相对路径。

## 文件说明

| 文件 | 作用 |
|---|---|
| `translate-md.js` | 底层公共库（API 请求 / 失败重试 / `.env` 加载 / responses↔chat/completions 双接口兜底），兼作单文件翻译 CLI |
| `check-doc-translations.js` | **主力**：扫描 `docs/`，翻译 `.md`/`.mdx` 与 `_category_.json`，含全套校验与图片同步 |
| `check-doc-links.js` | 检查 `docs/` 与各 `i18n` locale 下所有 `.md`/`.mdx` 里指向**本地图片 / 资源 / 其它 md 的相对引用**是否存在（防「文件移目录后 `./img/xxx`、`../other/yyy.md` 忘了改」导致的线上 404 / 跳转失败） |
| `prune-orphan-translations.js` | 删除各 `i18n` locale 下**没有 `docs/` 源对应物**的孤儿译文（源文档搬迁 / 删除后残留的旧翻译、旧图片），已接入 `npm run translate` 链自动执行 |
| `translate-i18n-json-itemized.js` | 逐条翻译 i18n JSON 文案（`navbar.json` / `footer.json` / `code.json` / `docs/current.json` / `blog/options.json`），**增量**（已有翻译保留） |
| `translate-i18n-json.js` | 可选：整文件**全量**重译 JSON。常规流程不跑，仅当需要强制重译 JSON 时用 `npm run translate-i18n-json-full` |

## 配置（`.env`）

复制 `.env.example` 为 `.env` 并填入：

```ini
OPENAI_API_KEY="你的 key"
OPENAI_BASE_URL="https://claude-proxy.shiroha.tech/v1"
OPENAI_MODEL="deepseek-v3.2"
```

> ⚠️ **模型名大小写敏感**。当前代理（claude-proxy）只认**小写** `deepseek-v3.2`；
> 写成 `DeepSeek-V3.2` 会报 `model_not_found`。
> 可用模型列表：`GET <OPENAI_BASE_URL>/models`。

> `.env` 已在 `.gitignore` 中，不会提交；配置变更请同步更新 `.env.example`。

## 常规流程

```bash
npm run translate
```

等价于三步：

1. `write-translations` — Docusaurus 生成 / 刷新 i18n 源 JSON
2. `check-doc-translations` — 翻译 `docs/`
3. `translate-i18n-json-itemized` — 增量翻译 UI 文案 JSON

## ✅ 推荐工作流：逐语言翻译 + 抽查

> 不要一次性全跑完就直接提交。按语言逐个来，每个都抽查、确认引用没问题，再继续下一个。

**第 1 步 — 先补一个语言（建议从 `en` 开始）：**

```bash
node tool/check-doc-translations.js --locale en --only missing
```

**第 2 步 — 抽查 3~5 个译文**，逐项确认：

- ✅ 语言正确：没有大段残留中文（短术语、代码、URL 除外）
- ✅ front matter：`title` 已翻译，`slug` / `sidebar_position` 保持不变
- ✅ 图片 / 链接的 **URL 没被翻译**（括号里的路径必须原样）

**第 3 步 — 引用完整性检查（重点）**：对比源与译文的链接数应一致。

```bash
# 把 <file> 换成要抽查的文档（相对 docs/ 的路径）
f="<file>"; s=$(grep -oE '\]\([^)]*\)' "docs/$f" | wc -l); \
t=$(grep -oE '\]\([^)]*\)' "i18n/en/docusaurus-plugin-content-docs/current/$f" | wc -l); \
echo "src=$s en=$t $([ "$s" = "$t" ] && echo ✓ || echo ✗)"
```

> 工具内部已对每个译文做链接数量校验（不一致就重试 / 报 `FAILED`），上面这步是事后的人工复核。

**第 4 步 — 没问题再译下一个语言：**

```bash
node tool/check-doc-translations.js --locale ja --only missing
node tool/check-doc-translations.js --locale es --only missing
node tool/check-doc-translations.js --locale de --only missing
```

每个语言重复第 2、3 步抽查。

## 增量规则

工具按文件 `mtime` 判断状态：

| 状态 | 条件 | 处理 |
|---|---|---|
| `missing` | 译文不存在 | 生成 |
| `outdated` | 源文件比译文新 | 重新翻译覆盖 |
| `ok` | 译文不旧于源 | 跳过 |

常用参数：

- `--only missing` 只补缺失（**新增文档后用这个**）
- `--only outdated` 只更新过时
- `--force` 无视 mtime，全部重译
- `--locale en,ja` 指定语言（逗号分隔）
- `--limit 0` 不输出逐条明细（日志更干净）
- `--concurrency 5` 并发数

## 写入前的自动校验

每个译文落盘前都会校验，不通过则在内部重试，仍不过则计为 `FAILED`：

- **链接数量**必须与源一致（防止模型丢链接、改 URL）—— 通过后会用源 URL 原样还原
- **目标语言正确**（按 CJK / 拉丁字符比例启发式判断，防“没翻译”或“翻错语言”）
- **有标题**（front matter `title` 或首行 `#`）；缺失时尝试从源补
- **不是模型拒答**（“I'm sorry, but I can't...”）

## 图片资源同步

翻译完成后，工具会把 `docs/` 中译文引用的本地图片自动复制到对应
`i18n/<locale>/.../` 目录。

- `[ASSET_COPIED]` 已复制
- `[ASSET_MISSING_SOURCE]` **源文档自己引用了不存在的图片**（源死链，与翻译无关，需在 `docs/` 侧修复）

## 死链检查（`check-doc-links.js`）

扫描 `docs/` + 全部 `i18n/<locale>/docusaurus-plugin-content-docs/current/`，提取每个
`.md`/`.mdx` 里的本地相对引用（Markdown 图片 `![alt](./img/x.png)`、Markdown 链接
`[文本](../other/y.md)`、JSX `require('./img/x.jpeg')`），按相对路径解析后检查目标文件
是否真实存在，列出所有死链（图片 / 链接分开统计）。

```bash
npm run check:doc-links                       # 扫 docs/ + 全部 locale
node tool/check-doc-links.js --locale en      # 只扫 en + 默认 docs/
```

发现死链返回退出码 1（可接入 CI / pre-commit）。只检查本地相对路径，跳过
`http(s):` / `data:` / 绝对路径 / 纯锚点 / MDX 插值。

> 💡 典型场景：把 `.md` 挪进更深的子目录后，`./img/xxx` 忘了改成 `../img/xxx`、
> `../other/yyy.md` 忘了改成 `../../other/yyy.md`，构建出的页面图片就 404、链接跳转失败；
> 翻译时图片没同步拷进 locale 目录同理。提交前跑一下即可拦住。
> 比构建的 `onBrokenMarkdownLinks` 更全（构建只 warn 且对部分编码路径有遗漏）。

## 孤儿译文清理（`prune-orphan-translations.js`）

源文档搬迁 / 重命名 / 删除后，旧的 i18n 译文不会自动消失，会在各 locale 下堆积出
`docs/` 里已不存在的孤儿（旧 `.md`、旧图片、空目录），产生过时重复路由。本工具按
「`docs/` 是唯一真相」清理：`i18n/<locale>/docusaurus-plugin-content-docs/current/` 下
每个文件，若 `docs/` 里不存在同相对路径的源文件，即为孤儿，删除并清理空目录。

```bash
npm run prune          # 实际删除（翻译链 npm run translate 末尾已自动跑）
npm run prune:check    # dry-run，只列出孤儿不删（提交 / CI 前先看一眼）
```

> 💡 配合 `check:doc-links` 一起用：prune 删孤儿后跑一遍 `check:doc-links`，可确认没有
> 译文还引用着被删的孤儿（若有，说明该文件本该一起搬/改路径）。`zh-Hans` 用 `docs/` 本身，
> 不参与清理。

## 已知问题

- `docs/player/old/`、`docs/player/client/` 等目录经历过搬迁，早期一批文档的 `./img/xxx`
  相对路径没跟着更新（应为 `../img/xxx`），已统一修复；后续挪文档务必同步改路径或跑 `npm run check:images`。

## 常见排错

| 现象 | 原因 / 处理 |
|---|---|
| 全部 `FAILED`，报 `model_not_found` | `.env` 的 `OPENAI_MODEL` 大小写不对，改小写 `deepseek-v3.2` |
| 全部 `FAILED`，报 401 / 鉴权失败 | `OPENAI_API_KEY` 无效或与 `OPENAI_BASE_URL` 不匹配 |
| 个别 `FAILED: missing_title` | 模型偶发丢标题，单独重跑该语言 `--only missing` 通常即可 |
| `npm run translate` 不生效 | 确认 `.env` 三行配置齐全且每行独立（末尾换行不要粘连） |
