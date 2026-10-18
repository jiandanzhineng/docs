# 硅基之下(UnderSilicon) 文档站

本项目使用 [Docusaurus](https://docusaurus.io/) 构建静态文档站点。

## 目录

- `content/`：网页文档源（默认语言 `zh-Hans`，站点 URL 仍为 `/docs/`）
- `i18n/<locale>/`：`en`/`ja`/`es`/`de` 译文与 UI 文案 JSON，翻译流程见 `tool/README.md`
- `blog/`：博客；`src/pages/`：独立页面
- `docs/`：项目备忘（`docs/adr`、`docs/note.md`），不参与网页构建

## 安装依赖

```bash
npm ci
```

## 本地开发

```bash
npm run start
```

默认会启动在 `http://localhost:3000`，修改后自动热更新。

开发服务器一次只启动一个 locale（默认 `zh-Hans`），此时访问 `/en/...` 等路径 404 属预期。
预览其他语言用 `npm run start:en`（另有 `start:zh` / `start:ja` / `start:es` / `start:de`）；
要在本地同时验证多语言路径，用 `npm run preview`（构建后 serve）。
`npm run write-translations` 提取待翻译的 UI 文案 JSON。

## 构建

```bash
npm run build
```

产物输出到 `build/`，可部署到任意静态托管。默认语言在根路径，其他语言在子路径（如 `build/en/`）。

## GitHub Actions 部署到 GitHub Pages

仓库已包含自动部署工作流：推送到 `main/master` 后会自动构建并发布到 GitHub Pages。

需要在 GitHub 仓库里做一次设置：
- Settings → Pages → Source 选择 “GitHub Actions”

### 站点地址配置（可选）

工作流默认按 GitHub Pages 的常见规则设置 `SITE_URL/BASE_URL`：
- 用户/组织主页仓库：`<owner>.github.io` → `BASE_URL=/`
- 项目页仓库：`<owner>.github.io/<repo>/` → `BASE_URL=/<repo>/`

如需自定义（例如绑定自定义域名），可在仓库 Variables 里添加：
- `SITE_URL`：如 `https://docs.example.com`
- `BASE_URL`：如 `/` 或 `/docs/`
