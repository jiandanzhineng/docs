不处理多语言文件，除非用户明确要求处理
移动文档时 需要一起移动当前文档引用的图片和其他文档指向本文档的链接

网页文档源在 content/，docs/ 只放项目备忘（ADR、note），不要把备忘写进 content/
站点对外 URL 仍是 /docs/，不要改 routeBasePath

提交前运行 npm run check:doc-links 检查图片/链接死链

