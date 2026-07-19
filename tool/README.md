# 翻译工具（tool/）

用大模型把中文文档（`docs/`）和 UI 文案（`i18n/`）翻译成 `en` / `ja` / `es` / `de`。
源语言固定为 `zh-Hans`（默认语言），翻译文件落在 `i18n/<locale>/docusaurus-plugin-content-docs/current/` 下，与源保持相同的相对路径。

## 文件说明

| 文件 | 作用 |
|---|---|
| `translate-md.js` | 底层公共库（API 请求 / 失败重试 / `.env` 加载 / responses↔chat/completions 双接口兜底），兼作单文件翻译 CLI |
| `check-doc-translations.js` | **主力**：扫描 `docs/`，翻译 `.md`/`.mdx` 与 `_category_.json`，含全套校验与图片同步 |
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

## 已知问题

- `docs/player/old/` 下若干旧玩法文档引用了已删除的图片目录
  `img/thpYQ8NHwnt7wx2c/*.png`，属于源文档自身死链，构建时这些图本就 404。
  需在源文档侧补图或删引用，翻译工具无法处理。

## 常见排错

| 现象 | 原因 / 处理 |
|---|---|
| 全部 `FAILED`，报 `model_not_found` | `.env` 的 `OPENAI_MODEL` 大小写不对，改小写 `deepseek-v3.2` |
| 全部 `FAILED`，报 401 / 鉴权失败 | `OPENAI_API_KEY` 无效或与 `OPENAI_BASE_URL` 不匹配 |
| 个别 `FAILED: missing_title` | 模型偶发丢标题，单独重跑该语言 `--only missing` 通常即可 |
| `npm run translate` 不生效 | 确认 `.env` 三行配置齐全且每行独立（末尾换行不要粘连） |
