/**
 * 商城商品 ↔ 文档页映射的读取与校验。
 * 约定：中文源页（siteDir/content 下）frontmatter 写 `products: [商品slug]`,
 * 所有语言副本共用；商品 slug 以提交进仓库的 src/data/shop-products.json 为准
 * （由 tool/sync-shop-products.mjs 从商城接口生成，构建不联网）。
 */

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

export const DOC_ID_DEFAULT = 'default';
export const DOCS_DIR_NAME = 'content';
export const SNAPSHOT_REL_PATH = path.join('src', 'data', 'shop-products.json');

/** 从 markdown 文件路径推导 Docusaurus doc unversionedId（相对路径去掉扩展名，posix 分隔）。 */
export function fileToDocId(contentDir, filePath) {
  const rel = path.relative(contentDir, filePath).split(path.sep).join('/');
  return rel.replace(/\.(md|mdx)$/i, '');
}

function walkMarkdownFiles(dir) {
  const files = [];
  if (!fs.existsSync(dir)) {
    return files;
  }
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkMarkdownFiles(full));
    } else if (/\.(md|mdx)$/i.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

/** 读取中文源页 frontmatter.products → {docId: [slug,...]}（只含声明了商品的页）。 */
export function readDocProducts(siteDir) {
  const contentDir = path.join(siteDir, DOCS_DIR_NAME);
  const map = {};
  for (const filePath of walkMarkdownFiles(contentDir)) {
    let parsed;
    try {
      parsed = matter(fs.readFileSync(filePath, 'utf8'));
    } catch (err) {
      throw new Error(`解析 frontmatter 失败：${filePath}（${err.message}）`);
    }
    const products = parsed.data?.products;
    if (products === undefined) {
      continue;
    }
    if (
      !Array.isArray(products) ||
      products.some((p) => typeof p !== 'string' || !p)
    ) {
      throw new Error(
        `frontmatter products 必须是商品 slug 字符串数组：${filePath}`,
      );
    }
    const docId = fileToDocId(contentDir, filePath);
    map[docId] = products;
  }
  return map;
}

/** 读取商品快照 {slug: {slug, nameZh, nameEn, image}}。 */
export function readProductSnapshot(siteDir) {
  const file = path.join(siteDir, SNAPSHOT_REL_PATH);
  if (!fs.existsSync(file)) {
    return {};
  }
  const list = JSON.parse(fs.readFileSync(file, 'utf8'));
  const map = {};
  for (const item of list) {
    map[item.slug] = item;
  }
  return map;
}

/**
 * 校验 frontmatter 里声明的商品 slug 是否都在快照里。
 * 返回 {docId: [未知slug,...]}，全部合法时为空对象。
 */
export function findUnknownSlugs(siteDir) {
  const docProducts = readDocProducts(siteDir);
  const snapshot = readProductSnapshot(siteDir);
  const unknown = {};
  for (const [docId, slugs] of Object.entries(docProducts)) {
    const bad = slugs.filter((slug) => !(slug in snapshot));
    if (bad.length > 0) {
      unknown[docId] = bad;
    }
  }
  return unknown;
}
