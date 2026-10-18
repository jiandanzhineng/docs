---
date: 2026-08-26
summary: docs 只放项目备忘，网页文档源移到 content/
---

# docs 只作项目备忘

`docs/` 只作项目备忘（ADR、note），不再兼作网页文档源；网页文档源移到 `content/`（Docusaurus `docs.path`）。站点对外 URL 仍是 `/docs/`，不改 `routeBasePath`。
