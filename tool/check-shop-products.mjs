#!/usr/bin/env node
/**
 * 检查中文源页 frontmatter 里的商品 slug 是否都存在于快照
 * src/data/shop-products.json。存在未知 slug 时退出码为 1（可接 CI）。
 *
 * 用法：node tool/check-shop-products.mjs
 */
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  findUnknownSlugs,
  readProductSnapshot,
} from '../src/plugins/shop-docs/shared.mjs';

const siteDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const snapshot = readProductSnapshot(siteDir);

if (Object.keys(snapshot).length === 0) {
  console.error(
    '缺少商品快照 src/data/shop-products.json，请先运行 npm run sync:shop-products',
  );
  process.exit(1);
}

const unknown = findUnknownSlugs(siteDir);
if (Object.keys(unknown).length === 0) {
  console.log('商品 slug 检查通过：全部存在。');
  process.exit(0);
}

console.error('存在快照中不存在的商品 slug：');
for (const [docId, slugs] of Object.entries(unknown)) {
  console.error(`  ${docId}: ${slugs.join(', ')}`);
}
process.exit(1);
