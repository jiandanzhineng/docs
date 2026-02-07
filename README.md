# 硅基之下(UnderSilicon) 文档站

本项目使用 [Docusaurus](https://docusaurus.io/) 构建静态文档站点。

## 安装依赖

```bash
npm ci
```

## 本地开发

```bash
npm run start
```

默认会启动在 `http://localhost:3000`，修改后自动热更新。

## 构建

```bash
npm run build
```

产物输出到 `build/`，可部署到任意静态托管。

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
