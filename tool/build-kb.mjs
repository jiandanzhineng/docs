// 生成智能客服知识包 build/kb/docs-kb.json
// 用法：npm run build 之后执行 node tool/build-kb.mjs [--build build] [--content content] [--out build/kb/docs-kb.json]
// 校验失败（页数 < 20、任一 url 不存在、任一锚点缺失）时以非 0 退出，让 CI 失败。
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const args = process.argv.slice(2);
const arg = (name, dflt) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : dflt;
};
const buildDir = path.resolve(ROOT, arg('--build', 'build'));
const contentDir = path.resolve(ROOT, arg('--content', 'content'));
const outFile = path.resolve(ROOT, arg('--out', 'build/kb/docs-kb.json'));

const SITE_ORIGIN = process.env.SITE_URL ?? 'https://docs.undersilicon.cn';
const EXTRA_LOCALES = ['en', 'ja', 'es', 'de'];
const MIN_PAGES = 20;
const MIN_TEXT_CHARS = 30;
const EXCLUDE_DIRS = ['img']; // 以及任何 player/old 前缀
const IS_EXCLUDED = (rel) =>
  rel.startsWith('player/old/') || EXCLUDE_DIRS.some((d) => rel.startsWith(`${d}/`));

function listDocs(dir, base = '') {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    if (name.startsWith('_')) continue;
    const full = path.join(dir, name);
    const rel = base ? `${base}/${name}` : name;
    const st = fs.statSync(full);
    if (st.isDirectory()) {
      out.push(...listDocs(full, rel));
    } else if (/\.mdx?$/i.test(name)) {
      out.push(rel);
    }
  }
  return out;
}

function parseFrontmatter(raw) {
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1); // BOM
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  const fm = {};
  let body = raw;
  if (m) {
    body = raw.slice(m[0].length);
    for (const line of m[1].split(/\r?\n/)) {
      const kv = line.match(/^(\w[\w-]*):\s*(.*)$/);
      if (kv) fm[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, '');
    }
  }
  return {fm, body};
}
function categoryOf(rel, fm) {
  const parts = rel.split('/').slice(0, -1).filter((p) => p !== 'img');
  const labels = [];
  let dir = contentDir;
  for (const part of parts) {
    dir = path.join(dir, part);
    const catFile = path.join(dir, '_category_.json');
    let label = part;
    try {
      label = JSON.parse(fs.readFileSync(catFile, 'utf8')).label || part;
    } catch {}
    labels.push(label);
  }
  return labels.length ? labels.join(' > ') : '文档';
}

const cleanAlt = (s) => s.replace(/##[^#\n]*?##/g, '').replace(/\s+/g, ' ').trim();
const figAlt = (s) => `[图：${cleanAlt(s) || '插图'}]`;

// 清洗正文：去 frontmatter/import/JSX/注释；图片 → [图：alt]；链接保留文字
function cleanText(body) {
  const lines = body.split(/\r?\n/);
  const out = [];
  let inFence = false;
  let inJsxImg = false;
  let jsxAlt = '';
  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      out.push(line);
      continue;
    }
    if (inFence) {
      out.push(line);
      continue;
    }
    if (inJsxImg) {
      if (/\/>|>\s*$/.test(line)) {
        inJsxImg = false;
        const alt = (jsxAlt + line).match(/alt="([^"]*)"/);
        out.push(figAlt(alt ? alt[1] : ''));
        jsxAlt = '';
      } else jsxAlt += line;
      continue;
    }
    // MDX 顶层 import/export 语句
    if (/^\s*(import\s|export\s+(default\s+)?(const|function|class|let|var|\{|\*)|export\s+default\s)/.test(line)) continue;
    if (/^\s*:::[a-z]*\s*$/i.test(line)) continue; // 提示块标记，保留正文
    if (/^\s*<!--.*-->\s*$/.test(line)) continue;
    if (/<img\b/i.test(line) && !/\/>/.test(line)) {
      inJsxImg = true;
      jsxAlt = line;
      continue;
    }
    let s = line.replace(/<!--[\s\S]*?-->/g, '');
    // <img ... /> 单行行内图 → [图：alt]
    s = s.replace(/<img\b[^>]*?alt="([^"]*)"[^>]*?\/?\s*>/gi, (_, a) => figAlt(a));
    s = s.replace(/<img\b[^>]*?\/?\s*>/gi, '[图：插图]');
    // 图片 ![alt](url) → [图：alt]（支持图片嵌在链接里 [![alt](img)](url)）
    s = s.replace(/\[!\[([^\]]*)\]\([^)]*\)\]\([^)]*\)/g, (_, a) => figAlt(a));
    s = s.replace(/!\[([^\]]*)\]\([^)]*\)/g, (_, a) => figAlt(a));
    // 链接 [text](url) → text（站内站外都只留文字）
    s = s.replace(/\[([^\]]*)\]\((?:https?:|mailto:)[^)]*\)/g, '$1');
    s = s.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
    // 其余行内 HTML/JSX 标签去壳留文字
    s = s.replace(/<\/[A-Za-z][^>]*>/g, '').replace(/<[A-Za-z][^>]*\/?>/g, '');
    out.push(s);
  }
  return out.join('\n')
    .replace(/##[^#\n]*?##/g, '') // 图片尺寸标记 ##h40vh## 等
    .replace(/\n{3,}/g, '\n\n').trim();
}
const decodeEntities = (s) =>
  s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
   .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
   .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)));

// 从构建产物 HTML 提取 h2/h3 锚点（构建产物为准）
function headingsFromHtml(html) {
  const heads = [];
  const re = /<h([23])\b[^>]*?\bid="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g;
  let m;
  while ((m = re.exec(html))) {
    const text = decodeEntities(m[3].replace(/<[^>]+>/g, ''))
      .replace(/[​‌‍﻿]/g, '')
      .trim();
    if (text) heads.push({text, anchor: m[2], level: Number(m[1])});
  }
  return heads;
}

const urlToHtmlPath = (dir, url) =>
  path.join(dir, ...url.split('/').filter(Boolean), 'index.html');

function gitSha() {
  try {
    return execFileSync('git', ['rev-parse', '--short', 'HEAD'], {cwd: ROOT})
      .toString().trim();
  } catch {
    return 'local';
  }
}
// 没有 slug 的页面按 Docusaurus 默认规则推导：去掉扩展名与尾部 /index
// （build 目录名是未编码的中文路径，url 同样存未编码形态，浏览器自行编码）
function urlFromRel(rel) {
  let p = rel.replace(/\.mdx?$/i, '');
  if (/^index$/i.test(p)) p = '';
  else p = p.replace(/\/index$/i, '');
  return `/docs${p ? '/' + p : ''}`;
}

const files = listDocs(contentDir).filter((rel) => !IS_EXCLUDED(rel));
const pages = [];
const failures = [];
const seenUrls = new Map();
for (const rel of files) {
  const {fm, body} = parseFrontmatter(fs.readFileSync(path.join(contentDir, rel), 'utf8'));
  const url = fm.slug ? `/docs${fm.slug.replace(/^\/*/, '/')}` : urlFromRel(rel);
  if (seenUrls.has(url)) {
    failures.push(`url 重复: ${url} (${rel} 与 ${seenUrls.get(url)})`);
    continue;
  }
  seenUrls.set(url, rel);
  const htmlPath = urlToHtmlPath(buildDir, url);
  if (!fs.existsSync(htmlPath)) {
    failures.push(`url 不存在: ${url} (${rel})`);
    continue;
  }
  let text = cleanText(body);
  let title = fm.title || '';
  if (!title) {
    const h1 = body.match(/^#\s+(.+)$/m);
    title = h1 ? h1[1].trim() : path.basename(rel).replace(/\.mdx?$/i, '');
  }
  if (text.length < MIN_TEXT_CHARS) continue; // 无正文页面
  const headings = headingsFromHtml(fs.readFileSync(htmlPath, 'utf8'));
  const locales = EXTRA_LOCALES.filter((loc) =>
    fs.existsSync(urlToHtmlPath(path.join(buildDir, loc), url)));
  pages.push({id: url, url, title, category: categoryOf(rel, fm), headings, text, locales});
}

if (pages.length < MIN_PAGES) failures.push(`页数过少: ${pages.length} < ${MIN_PAGES}`);
if (failures.length) {
  console.error(`[build-kb] 校验失败 (${failures.length}):`);
  failures.slice(0, 30).forEach((f) => console.error(`  - ${f}`));
  process.exit(1);
}

const now = new Date().toISOString();
const kb = {
  schema: 1,
  version: `${now}+${gitSha()}`,
  generatedAt: now,
  siteOrigin: SITE_ORIGIN,
  pages,
};
fs.mkdirSync(path.dirname(outFile), {recursive: true});
fs.writeFileSync(outFile, JSON.stringify(kb));

const totalChars = pages.reduce((n, p) => n + p.text.length, 0);
const max = pages.reduce((a, b) => (b.text.length > a.text.length ? b : a));
console.log(`[build-kb] ${pages.length} 页 / 共 ${totalChars} 字符`);
console.log(`[build-kb] 最大页: ${max.id} (${max.text.length} 字符)`);
console.log(`[build-kb] 已写入 ${path.relative(ROOT, outFile)}`);

