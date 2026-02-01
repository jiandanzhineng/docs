---
sidebar_position: 1
---

# 教程介绍

让我们在 **5 分钟内了解 Docusaurus**。

## 开始使用

通过 **创建一个新网站** 开始。

或者使用 **[docusaurus.new](https://docusaurus.new)** **立即尝试 Docusaurus**。

### 你需要什么

- [Node.js](https://nodejs.org/en/download/) 版本 18.0 或更高版本：
  - 安装 Node.js 时，建议勾选所有与依赖项相关的复选框。

## 生成新网站

使用 **classic 模板** 生成一个新的 Docusaurus 网站。

运行以下命令后，classic 模板将自动添加到你的项目中：

```bash
npm init docusaurus@latest my-website classic
```

你可以在命令提示符、Powershell、终端或代码编辑器的任何集成终端中输入此命令。

该命令还会安装运行 Docusaurus 所需的所有必要依赖项。

## 启动你的网站

运行开发服务器：

```bash
cd my-website
npm run start
```

`cd` 命令更改你正在使用的目录。为了使用你新创建的 Docusaurus 网站，你需要将终端导航到那里。

`npm run start` 命令在本地构建你的网站并通过开发服务器提供服务，准备好让你在 http://localhost:3000/ 查看。

打开 `docs/intro.md`（此页面）并编辑一些行：网站将 **自动重新加载** 并显示你的更改。
