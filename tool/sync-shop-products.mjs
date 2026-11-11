#!/usr/bin/env node
/**
 * 同步商城商品快照到 src/data/shop-products.json（需联网，CI 构建不调用）。
 *
 * 用法：
 *   npm run sync:shop-products
 *   node tool/sync-shop-products.mjs [--api https://shop.undersilicon.cn/api/products]
 *
 * 每个商品记录：slug、中文名、英文名、首图绝对网址。不含价格。
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const SITE_DIR = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT_FILE = path.join(SITE_DIR, 'src', 'data', 'shop-products.json');
const SHOP_ORIGIN = 'https://shop.undersilicon.cn';
const API_URL = `${SHOP_ORIGIN}/api/products`;

async function fetchProducts(locale) {
  const url = `${API_URL}?locale=${locale}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`请求 ${url} 失败：HTTP ${res.status}`);
  }
  return res.json();
}

const [zh, en] = await Promise.all([
  fetchProducts('zh'),
  fetchProducts('en'),
]);
const enNames = new Map(en.map((p) => [p.slug, p.name]));

const products = zh.map((p) => ({
  slug: p.slug,
  nameZh: p.name,
  nameEn: enNames.get(p.slug) || p.name,
  image: p.image
    ? p.image.startsWith('http')
      ? p.image
      : `${SHOP_ORIGIN}${p.image}`
    : '',
}));

fs.writeFileSync(OUT_FILE, `${JSON.stringify(products, null, 2)}\n`, 'utf8');
console.log(`已写入 ${OUT_FILE}（${products.length} 个商品）`);
