/**
 * check-doc-links.js — 检查文档里指向本地图片 / 资源 / 其它 md 的相对引用是否存在。
 *
 * 背景：把 .md 移到更深的子目录后，里面的 `./img/xxx`、`../other/yyy.md` 相对
 * 路径常常忘了跟着改（要 `../img/`、`../../other/`），又或者翻译时图片没同步拷进
 * 各 locale 目录，结果线上图片 404、链接跳转 404。本脚本专门扫这类「相对引用 →
 * 目标文件不存在」的死链，构建 / 提交前跑一下就能拦住。
 *
 * 覆盖的引用形式：
 *   - Markdown 图片：  ![alt](./img/x.png)        以及引用式  [ref]: ./img/x.png
 *   - Markdown 链接：  [文本](../other/y.md)      （本地相对 .md，会去掉 #锚点 后查文件）
 *   - JSX / MDX：      <img src={require('./img/x.jpeg').default} />
 *
 * 只检查「本地相对路径」。http(s):、data:、mailto:、pathname://、绝对路径
 * (/xxx)、纯锚点 (#xxx)、带 {插值} 的、Windows 盘符 (C:\) 一律跳过——和
 * Docusaurus 解析口径一致。注意：本脚本做的是「磁盘文件是否存在」的静态检查，
 * 比 Docusaurus 构建的 onBrokenMarkdownLinks 更全（构建只 warn 且对部分编码路径
 * 有遗漏），所以本脚本报出的链接死链可能多于构建警告——以本脚本为准去修。
 *
 * 用法：
 *   node tool/check-doc-links.js                 # 扫 docs/ + 全部 i18n locale
 *   node tool/check-doc-links.js --locale en     # 只扫 en + 默认 docs/
 *   node tool/check-doc-links.js --no-default    # 只扫 i18n，不扫 docs/
 *   node tool/check-doc-links.js --ext .md,.mdx
 *
 * 退出码：发现死链返回 1（可接入 CI / git hook），无死链返回 0。
 */

const fs = require('node:fs/promises');
const path = require('node:path');

const PLUGIN_DOCS_SUBDIR = path.join('docusaurus-plugin-content-docs', 'current');

function toPosixPath(p) {
  return p.split(path.sep).join('/');
}

/* ---------- 引用提取 ---------- */

function isLocalRelativeAssetUrl(url) {
  const raw = String(url || '').trim();
  if (!raw) return false;
  if (raw.startsWith('pathname://')) return false;
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(raw)) return false; // scheme: (http:, data:, mailto:)
  if (raw.startsWith('/') || raw.startsWith('\\')) return false; // 绝对路径
  if (raw.includes('{') || raw.includes('}')) return false; // MDX 插值
  if (/^[a-zA-Z]:[\\/]/.test(raw)) return false; // Windows 盘符
  return true;
}

// 统一提取图片(![..](url))、链接([..](url))与引用式定义([ref]: url)。
// 返回 [{ kind: 'image' | 'link', url, line }]，line 为 1-based。
function extractRefs(text) {
  const s = String(text || '');
  const lines = s.split(/\r?\n/);
  const refs = [];

  // !?[text](url) —— 一个正则同时吃图片和链接，靠前导 ! 区分，避免重复匹配
  const re = /(!?)\[([^\]]*)\]\(([^)]+)\)/g;
  for (const m of s.matchAll(re)) {
    const inside = String(m[3] || '').trim();
    if (!inside) continue;
    const cleaned =
      inside.startsWith('<') && inside.endsWith('>') ? inside.slice(1, -1) : inside;
    const firstToken = cleaned.trim().split(/\s+/)[0]; // 处理 `url "title"` 形式
    if (firstToken) {
      refs.push({
        kind: m[1] === '!' ? 'image' : 'link',
        url: firstToken,
        line: locateLine(lines, m.index),
      });
    }
  }

  // 引用式 [ref]: url
  const linkDefRe = /^\s*\[[^\]]+\]:\s*(\S+)\s*(?:"[^"]*"|'[^']*'|\([^)]*\))?\s*$/gm;
  for (const m of s.matchAll(linkDefRe)) {
    const rawUrl = String(m[1] || '').trim();
    if (rawUrl) refs.push({ kind: 'link', url: rawUrl, line: locateLine(lines, m.index) });
  }

  return refs;
}

// JSX / MDX require('...') / require("...")
function extractRequireRefs(text) {
  const s = String(text || '');
  const lines = s.split(/\r?\n/);
  const refs = [];
  const re = /\brequire\(\s*['"]([^'"]+)['"]\s*\)/g;
  for (const m of s.matchAll(re)) {
    const url = String(m[1] || '').trim();
    if (url) refs.push({ kind: 'image', url, line: locateLine(lines, m.index) });
  }
  return refs;
}

function locateLine(lines, index) {
  let consumed = 0;
  for (let i = 0; i < lines.length; i++) {
    const len = lines[i].length + 1;
    if (index < consumed + len) return i + 1;
    consumed += len;
  }
  return 1;
}

/* ---------- 文件遍历 / 存在性检查 ---------- */

async function* walkFiles(dirAbs) {
  let entries;
  try {
    entries = await fs.readdir(dirAbs, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = path.join(dirAbs, entry.name);
    if (entry.isDirectory()) {
      yield* walkFiles(full);
    } else if (entry.isFile()) {
      yield full;
    }
  }
}

async function fileExists(p) {
  try {
    const st = await fs.stat(p);
    return st.isFile();
  } catch {
    return false;
  }
}

// 图片/资源：直接查文件是否存在
async function resolveAssetExists(dirAbs, url) {
  return fileExists(path.resolve(dirAbs, url));
}

// 链接：去掉 #锚点 后查文件；无扩展名时尝试 .md / .mdx
async function resolveLinkExists(dirAbs, url) {
  let p = String(url).split('#')[0];
  if (!p) return true; // 纯锚点，无法静态校验，放行
  const base = path.resolve(dirAbs, p);
  if (await fileExists(base)) return true;
  if (!path.extname(base)) {
    if (await fileExists(`${base}.md`)) return true;
    if (await fileExists(`${base}.mdx`)) return true;
  }
  return false;
}

/* ---------- 参数 ---------- */

function parseArgs(argv) {
  const args = {
    sourceDir: 'docs',
    i18nDir: 'i18n',
    includeDefault: true,
    locales: null,
    extensions: new Set(['.md', '.mdx']),
    help: false,
  };
  const takeValue = (i) => {
    if (i + 1 >= argv.length) throw new Error(`缺少参数值：${argv[i]}`);
    return argv[i + 1];
  };
  for (let i = 2; i < argv.length; i++) {
    const t = argv[i];
    if (t === '--help' || t === '-h') args.help = true;
    else if (t === '--no-default' || t === '--no-default-locale') args.includeDefault = false;
    else if (t === '--source-dir') (args.sourceDir = takeValue(i)), i++;
    else if (t === '--i18n-dir') (args.i18nDir = takeValue(i)), i++;
    else if (t === '--locale' || t === '--locales') {
      args.locales = takeValue(i)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      i++;
    } else if (t === '--ext' || t === '--extensions') {
      args.extensions = new Set(
        takeValue(i)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
          .map((e) => (e.startsWith('.') ? e : `.${e}`)),
      );
      i++;
    } else {
      throw new Error(`未知参数：${t}`);
    }
  }
  return args;
}

function printHelp() {
  process.stdout.write(
    [
      '用法: node tool/check-doc-links.js [选项]',
      '',
      '检查 docs/ 与 i18n/<locale>/docusaurus-plugin-content-docs/current/ 下所有',
      '.md/.mdx 里指向本地图片 / 资源 / 其它 md 的相对引用，列出目标不存在的死链。',
      '',
      '选项:',
      '  --source-dir <dir>   默认源目录 (默认 docs)',
      '  --i18n-dir <dir>     i18n 根目录 (默认 i18n)',
      '  --locale <a,b>       只扫指定 locale (逗号分隔)，默认全部',
      '  --no-default         不扫默认源 docs/，只扫 i18n',
      '  --ext <.md,.mdx>     要扫描的扩展名 (默认 .md,.mdx)',
      '  -h, --help           显示本帮助',
      '',
      '退出码: 发现死链返回 1，否则 0。',
      '',
    ].join('\n'),
  );
}

/* ---------- 主流程 ---------- */

async function listLocales(i18nDirAbs) {
  try {
    const entries = await fs.readdir(i18nDirAbs, { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).map((e) => e.name).sort();
  } catch {
    return [];
  }
}

async function scanRoot(rootAbs, rootLabel, extensions, broken) {
  let filesScanned = 0;
  let refsChecked = 0;
  for await (const fileAbs of walkFiles(rootAbs)) {
    if (!extensions.has(path.extname(fileAbs))) continue;
    filesScanned++;
    let text;
    try {
      text = await fs.readFile(fileAbs, 'utf8');
    } catch {
      continue;
    }
    const refs = [...extractRefs(text), ...extractRequireRefs(text)];
    const dirAbs = path.dirname(fileAbs);
    for (const ref of refs) {
      if (!isLocalRelativeAssetUrl(ref.url)) continue;
      refsChecked++;
      const exists =
        ref.kind === 'link'
          ? await resolveLinkExists(dirAbs, ref.url)
          : await resolveAssetExists(dirAbs, ref.url);
      if (!exists) {
        broken.push({
          kind: ref.kind,
          root: rootLabel,
          fileAbs,
          line: ref.line,
          url: ref.url,
        });
      }
    }
  }
  return { filesScanned, refsChecked };
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    printHelp();
    return;
  }

  const repoRoot = process.cwd();
  const sourceDirAbs = path.resolve(repoRoot, args.sourceDir);
  const i18nDirAbs = path.resolve(repoRoot, args.i18nDir);

  const allLocales = await listLocales(i18nDirAbs);
  const locales = args.locales
    ? args.locales.filter((l) => allLocales.includes(l))
    : allLocales;

  const broken = [];
  const perRoot = [];

  if (args.includeDefault) {
    const r = await scanRoot(sourceDirAbs, `默认(${args.sourceDir})`, args.extensions, broken);
    perRoot.push({ label: `默认(${args.sourceDir})`, ...r });
  }
  for (const locale of locales) {
    const rootAbs = path.join(i18nDirAbs, locale, PLUGIN_DOCS_SUBDIR);
    const r = await scanRoot(rootAbs, `i18n/${locale}`, args.extensions, broken);
    perRoot.push({ label: `i18n/${locale}`, ...r });
  }

  // 明细：先链接后图片，按文件聚合
  if (broken.length) {
    const images = broken.filter((b) => b.kind === 'image');
    const links = broken.filter((b) => b.kind === 'link');
    process.stdout.write(`\n发现 ${broken.length} 处死链（图片 ${images.length} / 链接 ${links.length}）：\n`);
    for (const b of broken) {
      const relFile = toPosixPath(path.relative(repoRoot, b.fileAbs));
      const tag = b.kind === 'image' ? 'BROKEN_IMG' : 'BROKEN_LINK';
      process.stdout.write(`  [${tag}] ${relFile}:${b.line}  ${b.url}\n`);
    }
  }

  // 汇总
  process.stdout.write('\n— 汇总 —\n');
  for (const r of perRoot) {
    process.stdout.write(
      `  ${r.label.padEnd(18)} 扫描 ${r.filesScanned} 文件 / 检查 ${r.refsChecked} 引用\n`,
    );
  }
  const totalScanned = perRoot.reduce((a, r) => a + r.filesScanned, 0);
  const totalChecked = perRoot.reduce((a, r) => a + r.refsChecked, 0);
  process.stdout.write(
    `\n合计: 扫描 ${totalScanned} 文件, 检查 ${totalChecked} 引用, 死链 ${broken.length} 处。` +
      (broken.length ? '' : ' ✅ 无死链') +
      '\n',
  );

  if (broken.length) process.exitCode = 1;
}

main().catch((err) => {
  process.stderr.write(`${err && err.stack ? err.stack : String(err)}\n`);
  process.exitCode = 1;
});
