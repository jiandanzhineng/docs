const fs = require('node:fs/promises');
const path = require('node:path');
const { requestTranslate, normalizeBaseUrl } = require('./translate-md');

function toPosixPath(p) {
  return p.split(path.sep).join('/');
}

async function loadDotEnvIfPresent(repoRoot) {
  const envPath = path.join(repoRoot, '.env');
  let raw;
  try {
    raw = await fs.readFile(envPath, 'utf8');
  } catch {
    return;
  }

  const lines = String(raw).split(/\r?\n/);
  for (const lineRaw of lines) {
    const line = String(lineRaw || '').trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    if (!key) continue;
    let value = line.slice(eq + 1).trim();
    if (!value) continue;

    if (
      (value.startsWith('"') && value.endsWith('"') && value.length >= 2) ||
      (value.startsWith("'") && value.endsWith("'") && value.length >= 2)
    ) {
      value = value.slice(1, -1);
    }
    value = value.replace(/\\n/g, '\n');

    if (process.env[key] == null || process.env[key] === '') {
      process.env[key] = value;
    }
  }
}

function parseArgs(argv) {
  const args = {
    sourceDir: 'docs',
    i18nDir: 'i18n',
    defaultLocale: 'zh-Hans',
    includeDefaultLocale: false,
    pluginDocsSubdir: path.join('docusaurus-plugin-content-docs', 'current'),
    locales: null,
    limit: Infinity,
    only: 'all',
    force: false,
    concurrency: 5,
    apiKey: null,
    baseUrl: null,
    model: 'DeepSeek-V3.2',
    checkLocaleMapping: false,
    extensions: new Set(['.md', '.mdx']),
    help: false,
  };

  const takeValue = (i) => {
    if (i + 1 >= argv.length) throw new Error(`缺少参数值：${argv[i]}`);
    return argv[i + 1];
  };

  for (let i = 2; i < argv.length; i++) {
    const token = argv[i];
    if (!token) continue;

    if (token === '--include-default-locale') {
      args.includeDefaultLocale = true;
      continue;
    }
    if (token === '--force') {
      args.force = true;
      continue;
    }
    if (token === '--check-locale-mapping' || token === '--print-locale-mapping') {
      args.checkLocaleMapping = true;
      continue;
    }
    if (token === '--help' || token === '-h') {
      args.help = true;
      continue;
    }

    const [k, v] = token.includes('=') ? token.split(/=(.*)/s) : [token, null];
    const key = k;
    const value = v ?? takeValue(i++);

    switch (key) {
      case '--source-dir': args.sourceDir = value; break;
      case '--i18n-dir': args.i18nDir = value; break;
      case '--default-locale': args.defaultLocale = value; break;
      case '--plugin-docs-subdir': args.pluginDocsSubdir = value; break;
      case '--locale':
      case '--locales':
        args.locales = value.split(',').map((s) => s.trim()).filter(Boolean);
        break;
      case '--limit':
      case '-n': {
        const n = Number(value);
        if (!Number.isFinite(n) || n < 0) throw new Error(`limit 必须是非负数字：${value}`);
        args.limit = n === 0 ? 0 : n;
        break;
      }
      case '--only': {
        const normalized = value.trim().toLowerCase();
        if (!['all', 'missing', 'outdated'].includes(normalized)) {
          throw new Error(`only 仅支持 all|missing|outdated：${value}`);
        }
        args.only = normalized;
        break;
      }
      case '--concurrency': {
        const n = Number(value);
        if (!Number.isFinite(n) || n <= 0) throw new Error(`concurrency 必须是正整数：${value}`);
        args.concurrency = Math.floor(n);
        break;
      }
      case '--api-key': args.apiKey = value; break;
      case '--base-url': args.baseUrl = value; break;
      case '--model': args.model = value; break;
      case '--ext':
      case '--extensions': {
        const parts = value.split(',').map((s) => s.trim()).filter(Boolean);
        args.extensions = new Set(parts.map((e) => (e.startsWith('.') ? e : `.${e}`)));
        break;
      }
      default:
        throw new Error(`未知参数：${token}`);
    }
  }

  return args;
}

async function listLocales(i18nDirAbs) {
  try {
    const entries = await fs.readdir(i18nDirAbs, { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    return [];
  }
}

async function* walkFiles(dirAbs) {
  const entries = await fs.readdir(dirAbs, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirAbs, entry.name);
    if (entry.isDirectory()) {
      yield* walkFiles(fullPath);
    } else if (entry.isFile()) {
      yield fullPath;
    }
  }
}

function resolveModel({ cliModel, envModel, defaultModel }) {
  if (cliModel) return cliModel;
  if (envModel) return envModel;
  return defaultModel;
}

async function sleep(ms) {
  await new Promise((r) => setTimeout(r, ms));
}

async function requestWithRetry(fn, maxRetries = 3) {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      if (attempt >= maxRetries) throw err;
      const waitMs = Math.min(30_000, 800 * 2 ** attempt);
      attempt += 1;
      await sleep(waitMs);
    }
  }
}

function countMatches(text, re) {
  const m = String(text || '').match(re);
  return m ? m.length : 0;
}

function normalizeLocaleTag(locale) {
  return String(locale || '')
    .trim()
    .toLowerCase()
    .replace(/_/g, '-');
}

function localeToTargetLang(locale) {
  const map = {
    en: 'English',
    ja: 'Japanese',
    de: 'German',
    es: 'Spanish',
    fr: 'French',
    ko: 'Korean',
    it: 'Italian',
    ru: 'Russian',
    ar: 'Arabic',
    th: 'Thai',
    pt: 'Portuguese',
    'pt-br': 'Portuguese',
    id: 'Indonesian',
    vi: 'Vietnamese',
    zh: 'Chinese',
    'zh-hans': 'Chinese',
    'zh-cn': 'Chinese',
    'zh-hant': 'Chinese',
    'zh-tw': 'Chinese',
    'zh-hk': 'Chinese',
  };
  const key = normalizeLocaleTag(locale);
  if (map[key]) return map[key];
  const primary = key.split('-')[0];
  if (map[primary]) return map[primary];
  return locale;
}

function localeToTargetLangCandidates(locale) {
  const loc = normalizeLocaleTag(locale);
  const primary = loc.split('-')[0];
  const preferred = localeToTargetLang(locale);
  const nativeMap = {
    de: 'Deutsch',
    es: 'Español',
    ja: '日本語',
    fr: 'Français',
    it: 'Italiano',
    pt: 'Português',
    ru: 'Русский',
    ar: 'العربية',
    ko: '한국어',
    th: 'ไทย',
    vi: 'Tiếng Việt',
    id: 'Bahasa Indonesia',
    zh: '中文',
  };
  const candidates = [preferred, primary, nativeMap[primary]].filter((v) => typeof v === 'string' && v.trim());
  const unique = [];
  for (const c of candidates) {
    const v = c.trim();
    if (!unique.includes(v)) unique.push(v);
  }
  return unique;
}

function stripFrontMatter(text) {
  const s = String(text || '');
  if (!s.trimStart().startsWith('---')) return s;
  const idx = s.indexOf('\n---');
  if (idx === -1) return s;
  return s.slice(idx + '\n---'.length);
}

function normalizeForLanguageHeuristic(text) {
  let s = String(text || '');
  s = stripFrontMatter(s);
  s = s.replace(/```[\s\S]*?```/g, ' ');
  s = s.replace(/`[^`]*`/g, ' ');
  s = s.replace(/!\[[^\]]*?\]\(([^)]+)\)/g, ' ');
  s = s.replace(/\[[^\]]*?\]\(([^)]+)\)/g, ' ');
  s = s.replace(/https?:\/\/\S+/g, ' ');
  s = s.replace(/<[^>]+>/g, ' ');
  return s;
}

function guessSourceLang(text) {
  const raw = normalizeForLanguageHeuristic(text);
  const cjk = countMatches(raw, /[\u4E00-\u9FFF]/g);
  const latin = countMatches(raw, /[A-Za-z]/g);
  if (cjk >= 80 && cjk > latin) return 'Chinese';
  return 'auto';
}

function buildTranslationUserPrompt({ targetLang, forceTargetLang = false }) {
  return [
    '你是一个专业的技术文档翻译器。',
    `请将以下 Markdown 翻译为 ${targetLang}。`,
    forceTargetLang ? `必须输出 ${targetLang}，不要保留中文段落。` : null,
    '如果原文包含 YAML front matter 或首行标题，请保留它们的结构位置。',
    '不要翻译 Markdown 链接/图片括号中的目标路径，只翻译可见文本。',
    '只输出译文 Markdown，不要添加解释。',
  ]
    .filter(Boolean)
    .join('\n');
}

function buildJsonTranslationUserPrompt({ targetLang }) {
  return [
    '你是一个专业的软件国际化翻译助手。',
    `请将以下 JSON 内容中的 "label" 和 "description"（如果存在）字段翻译为 ${targetLang}。`,
    '保持 JSON 结构完全不变，不要修改 key，不要添加额外的字段。',
    '只输出翻译后的 JSON 字符串，不要包含 Markdown 代码块标记（如 ```json ... ```）。',
  ].join('\n');
}

function validateTranslatedJson(text) {
  try {
    const clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
    JSON.parse(clean);
    return null;
  } catch (e) {
    return 'invalid_json';
  }
}

function validateTranslatedLanguage(locale, translatedText) {
  const loc = normalizeLocaleTag(locale);
  const primary = loc.split('-')[0];
  const raw = normalizeForLanguageHeuristic(translatedText);

  if (primary === 'zh') return null;

  if (primary === 'ja') {
    const kana = countMatches(raw, /[\u3040-\u30FF]/g);
    if (kana < 8) return 'wrong_language';
    return null;
  }

  const cjk = countMatches(raw, /[\u4E00-\u9FFF]/g);
  if ((primary === 'de' || primary === 'es' || primary === 'en' || primary === 'fr' || primary === 'it') && cjk > 30) {
    return 'wrong_language';
  }
  return null;
}

function stripBomAndTrimLeft(text) {
  return String(text || '').replace(/^\uFEFF/, '').replace(/^\s+/, '');
}

function extractFrontMatterBlock(text) {
  const s = stripBomAndTrimLeft(text);
  if (!s.startsWith('---')) return null;
  const end = s.indexOf('\n---', 3);
  if (end === -1) return null;
  return s.slice(0, end + '\n---'.length);
}

function hasDocTitle(text) {
  const s = stripBomAndTrimLeft(text);
  const fm = extractFrontMatterBlock(s);
  if (fm && /(^|\n)title\s*:\s*\S+/i.test(fm)) return true;

  const withoutFm = fm ? s.slice(fm.length) : s;
  const lines = withoutFm.split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    return /^#\s+\S+/.test(line);
  }
  return false;
}

function isModelRefusal(text) {
  const s = String(text || '').trim();
  if (!s) return true;
  return (
    /i\s*'?m\s*sorry,?\s*but\s*i\s*can(?:'|’)?t\s*assist\s*with\s*that\s*request\.?/i.test(s) ||
    /can(?:'|’)?t\s*assist\s*with\s*that\s*request/i.test(s)
  );
}

function validateTranslatedDoc(text, locale) {
  if (isModelRefusal(text)) return 'model_refusal';
  const langReason = validateTranslatedLanguage(locale, text);
  if (langReason) return langReason;
  if (!hasDocTitle(text)) return 'missing_title';
  return null;
}

function extractSourceTitleLine(text) {
  const s = stripBomAndTrimLeft(text);
  const fm = extractFrontMatterBlock(s);
  if (fm) {
    const m = fm.match(/(^|\n)title\s*:\s*(.+)\s*$/i);
    if (m && m[2]) return `# ${String(m[2]).trim()}`;
  }
  const withoutFm = fm ? s.slice(fm.length) : s;
  const lines = withoutFm.split(/\r?\n/);
  for (const rawLine of lines) {
    const line = String(rawLine || '').trim();
    if (!line) continue;
    if (line.startsWith('#')) return line;
    break;
  }
  return '';
}

function stripQueryAndHash(url) {
  const s = String(url || '');
  const q = s.indexOf('?');
  const h = s.indexOf('#');
  const cut = q === -1 ? h : h === -1 ? q : Math.min(q, h);
  return cut === -1 ? s : s.slice(0, cut);
}

function tryDecodeUrlPath(s) {
  try {
    return decodeURI(s);
  } catch {
    return s;
  }
}

function isLocalRelativeAssetUrl(url) {
  const raw = String(url || '').trim();
  if (!raw) return false;
  if (raw.startsWith('pathname://')) return false;
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(raw)) return false;
  if (raw.startsWith('/') || raw.startsWith('\\')) return false;
  if (raw.includes('{') || raw.includes('}')) return false;
  if (/^[a-zA-Z]:[\\/]/.test(raw)) return false;
  return true;
}

function extractMarkdownImageUrls(markdown) {
  const text = String(markdown || '');
  const urls = [];

  const inlineImageRe = /!\[[^\]]*?\]\(([^)]+)\)/g;
  for (const m of text.matchAll(inlineImageRe)) {
    const rawInsideParens = String(m[1] || '').trim();
    if (!rawInsideParens) continue;
    const cleaned = rawInsideParens.startsWith('<') && rawInsideParens.endsWith('>') ? rawInsideParens.slice(1, -1) : rawInsideParens;
    const firstToken = cleaned.trim().split(/\s+/)[0];
    if (firstToken) urls.push(firstToken);
  }

  const linkDefRe = /^\s*\[[^\]]+\]:\s*(\S+)\s*(?:"[^"]*"|'[^']*'|\([^)]*\))?\s*$/gm;
  for (const m of text.matchAll(linkDefRe)) {
    const rawUrl = String(m[1] || '').trim();
    if (rawUrl) urls.push(rawUrl);
  }

  return urls;
}

function extractMdLinks(text) {
  const urls = [];
  // Matches [text](url) and ![alt](url)
  // Group 2 is the URL content inside parentheses
  const re = /(!?\[[^\]]*?\]\()([^)]*)(\))/g;
  const s = String(text || '');
  for (const m of s.matchAll(re)) {
    urls.push(m[2]);
  }
  return urls;
}

function restoreMdLinks(text, originalUrls) {
  let i = 0;
  const re = /(!?\[[^\]]*?\]\()([^)]*)(\))/g;
  const s = String(text || '');
  return s.replace(re, (match, prefix, url, suffix) => {
    if (i < originalUrls.length) {
      return `${prefix}${originalUrls[i++]}${suffix}`;
    }
    return match;
  });
}

async function fileExists(filePathAbs) {
  try {
    const st = await fs.stat(filePathAbs);
    return st.isFile();
  } catch {
    return false;
  }
}

async function syncImagesForTranslationFile({
  repoRoot,
  srcDocPathAbs,
  trDocPathAbs,
  counts,
  shouldPrint,
  printLine,
}) {
  const trText = await fs.readFile(trDocPathAbs, 'utf8');
  const urls = extractMarkdownImageUrls(trText);
  const unique = new Set(urls.map((u) => String(u || '').trim()).filter(Boolean));

  for (const url of unique) {
    if (!isLocalRelativeAssetUrl(url)) {
      counts.assetsSkippedNotRelative += 1;
      continue;
    }

    const relPathRaw = stripQueryAndHash(url);
    const relPath = tryDecodeUrlPath(relPathRaw);
    if (!relPath) {
      counts.assetsSkippedNotRelative += 1;
      continue;
    }

    const srcAssetAbs = path.resolve(path.dirname(srcDocPathAbs), relPath);
    const destAssetAbs = path.resolve(path.dirname(trDocPathAbs), relPath);

    const srcRelToRepo = path.relative(repoRoot, srcAssetAbs);
    if (!srcRelToRepo || srcRelToRepo.startsWith('..') || path.isAbsolute(srcRelToRepo)) {
      counts.assetsSkippedOutsideRepo += 1;
      continue;
    }

    const destRelToRepo = path.relative(repoRoot, destAssetAbs);
    if (!destRelToRepo || destRelToRepo.startsWith('..') || path.isAbsolute(destRelToRepo)) {
      counts.assetsSkippedOutsideRepo += 1;
      continue;
    }

    const srcOk = await fileExists(srcAssetAbs);
    if (!srcOk) {
      counts.assetsMissingSource += 1;
      if (shouldPrint()) {
        printLine(`[ASSET_MISSING_SOURCE] ${toPosixPath(srcRelToRepo)} (for ${toPosixPath(destRelToRepo)})`);
      }
      continue;
    }

    const destOk = await fileExists(destAssetAbs);
    if (destOk) {
      counts.assetsSkippedExisting += 1;
      continue;
    }

    try {
      await fs.mkdir(path.dirname(destAssetAbs), { recursive: true });
      await fs.copyFile(srcAssetAbs, destAssetAbs);
      counts.assetsCopied += 1;
      if (shouldPrint()) {
        printLine(`[ASSET_COPIED] ${toPosixPath(srcRelToRepo)} -> ${toPosixPath(destRelToRepo)}`);
      }
    } catch (err) {
      counts.assetsFailed += 1;
      process.stderr.write(
        `[ASSET_FAILED] ${toPosixPath(srcRelToRepo)} -> ${toPosixPath(destRelToRepo)}\n${err && err.stack ? err.stack : String(err)}\n`,
      );
    }
  }
}

function printHelp() {
  const lines = [
    '用法：node tool/check-doc-translations.js [options]',
    '',
    '默认行为：扫描 docs/ 下的 .md/.mdx，自动为各语言生成/更新对应翻译文件。',
    '规则：翻译文件不存在 => 生成；源文件比翻译文件新 => 重新翻译覆盖；否则跳过。',
    '',
    'API 配置（建议用环境变量）：',
    '  OPENAI_API_KEY=...             必需（DMXAPI token）',
    '  OPENAI_BASE_URL=https://www.dmxapi.cn/v1   可选',
    '  OPENAI_MODEL=DeepSeek-V3.2     可选',
    '',
    '选项：',
    '  --locale en,ja        仅处理指定语言（逗号分隔）',
    '  --include-default-locale  也处理 defaultLocale（默认不处理）',
    '  --default-locale zh-Hans  默认语言（用于过滤 locales 的默认值）',
    '  --only all|missing|outdated  仅处理全部/缺失/落后（默认 all）',
    '  --force               无视 mtime，全部重翻译',
    '  --check-locale-mapping  仅输出 locale -> target_lang 映射后退出',
    '  --concurrency 5        并发翻译数量（默认 5）',
    '  --limit 50 | -n 50     仅输出前 N 条明细（默认全部；0 表示不输出明细）',
    '  --source-dir docs     源文档目录（默认 docs）',
    '  --i18n-dir i18n       i18n 根目录（默认 i18n）',
    '  --plugin-docs-subdir <path>  翻译 docs 子目录（默认 docusaurus-plugin-content-docs/current）',
    '  --ext md,mdx          扫描的文件后缀（默认 md,mdx）',
    '  --api-key <key>       覆盖 OPENAI_API_KEY',
    '  --base-url <url>      覆盖 OPENAI_BASE_URL（默认 https://www.dmxapi.cn/v1）',
    '  --model <name>        覆盖 OPENAI_MODEL（默认 DeepSeek-V3.2）',
  ];
  process.stdout.write(`${lines.join('\n')}\n`);
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    printHelp();
    return;
  }

  const repoRoot = process.cwd();
  await loadDotEnvIfPresent(repoRoot);
  const sourceDirAbs = path.resolve(repoRoot, args.sourceDir);
  const i18nDirAbs = path.resolve(repoRoot, args.i18nDir);

  const baseUrl = normalizeBaseUrl(args.baseUrl || process.env.OPENAI_BASE_URL || 'https://www.dmxapi.cn/v1');
  const model = resolveModel({
    cliModel: args.model,
    envModel: process.env.OPENAI_MODEL,
    defaultModel: 'DeepSeek-V3.2',
  });

  const allLocales = await listLocales(i18nDirAbs);
  // Default to allLocales if args.locales is null/empty
  const targetLocales = args.locales && args.locales.length > 0 ? args.locales : allLocales;
  const locales = targetLocales
    .filter((l) => (args.includeDefaultLocale ? true : l !== args.defaultLocale))
    .sort((a, b) => a.localeCompare(b));

  if (args.checkLocaleMapping) {
    process.stdout.write(`baseUrl=${baseUrl}\nmodel=${model}\n`);
    for (const locale of locales) {
      const targetLang = localeToTargetLang(locale);
      process.stdout.write(`locale=${locale} target_lang=${targetLang}\n`);
    }
    return;
  }

  const apiKey = args.apiKey || process.env.OPENAI_API_KEY || process.env.DMX_API_KEY || '';
  if (!apiKey) {
    throw new Error('缺少 API Key：请设置环境变量 OPENAI_API_KEY（或使用 --api-key）');
  }
  if (!baseUrl) {
    throw new Error('base url 无效：请设置 OPENAI_BASE_URL（或使用 --base-url）');
  }

  const counts = {
    locales: locales.length,
    scannedSourceFiles: 0,
    translatedMissing: 0,
    updatedOutdated: 0,
    skipped: 0,
    failed: 0,
    assetsCopied: 0,
    assetsSkippedExisting: 0,
    assetsMissingSource: 0,
    assetsFailed: 0,
    assetsSkippedNotRelative: 0,
    assetsSkippedOutsideRepo: 0,
  };

  const warnedTargetLangLocales = new Set();

  let printed = 0;
  const shouldPrint = () => printed < args.limit;
  const printLine = (line) => {
    if (!shouldPrint()) return;
    printed += 1;
    process.stdout.write(`${line}\n`);
  };

  const active = new Set();
  const schedule = async (fn) => {
    const p = (async () => fn())();
    active.add(p);
    p.finally(() => active.delete(p));
    if (active.size >= args.concurrency) {
      await Promise.race(active);
    }
  };

  const sourceFiles = [];
  const translationTasks = [];

  process.stdout.write('正在扫描源文件和翻译状态...\n');

  for await (const srcPathAbs of walkFiles(sourceDirAbs)) {
    const ext = path.extname(srcPathAbs).toLowerCase();
    const isCategoryJson = path.basename(srcPathAbs) === '_category_.json';
    if (!args.extensions.has(ext) && !isCategoryJson) continue;
    sourceFiles.push(srcPathAbs);
    counts.scannedSourceFiles += 1;

    const relFromSource = path.relative(sourceDirAbs, srcPathAbs);
    if (isCategoryJson) {
        // console.log(`DEBUG: Found JSON ${relFromSource}`);
    }
    const srcStat = await fs.stat(srcPathAbs);

    for (const locale of locales) {
      const trPathAbs = path.join(i18nDirAbs, locale, args.pluginDocsSubdir, relFromSource);

      let trStat = null;
      try {
        trStat = await fs.stat(trPathAbs);
      } catch {
        trStat = null;
      }

      const isMissing = !trStat;
      if (isCategoryJson && isMissing) {
         // console.log(`DEBUG: Missing JSON translation for ${locale}: ${trPathAbs}`);
      }

      const isOutdated = !!trStat && srcStat.mtimeMs > trStat.mtimeMs;
      const status = isMissing ? 'missing' : isOutdated ? 'outdated' : 'ok';

      const matchesOnly =
        args.only === 'all' ||
        (args.only === 'missing' && status === 'missing') ||
        (args.only === 'outdated' && status === 'outdated');
      const shouldTranslate = args.force || status === 'missing' || status === 'outdated';

      if (!matchesOnly || !shouldTranslate) {
        counts.skipped += 1;
        continue;
      }

      const sourceRel = toPosixPath(path.join(args.sourceDir, relFromSource));
      const translationRel = toPosixPath(
        path.join(args.i18nDir, locale, toPosixPath(args.pluginDocsSubdir), relFromSource),
      );

      translationTasks.push(async () => {
        try {
          const targetLang = localeToTargetLang(locale);
          const targetLangCandidates = localeToTargetLangCandidates(locale);
          if (
            targetLang === locale &&
            !warnedTargetLangLocales.has(locale) &&
            /^[a-zA-Z]{2,3}([_-][a-zA-Z0-9]{2,8})*$/.test(String(locale || ''))
          ) {
            warnedTargetLangLocales.add(locale);
            process.stderr.write(
              `locale=${locale} 未命中 target_lang 映射，将直接使用 ${targetLang}；如翻译语言异常，请在 localeToTargetLang() 中补充映射\n`,
            );
          }
          const content = await fs.readFile(srcPathAbs, 'utf8');
          let translated = '';
          let invalidReason = null;
          const isCategoryJson = path.basename(srcPathAbs) === '_category_.json';

          if (isCategoryJson) {
            const prompt = buildJsonTranslationUserPrompt({ targetLang });
            const fullPrompt = `${prompt}\n\n${content}`;
            try {
              translated = await requestWithRetry(() => requestTranslate(baseUrl, apiKey, model, fullPrompt));
              // Clean up markdown code blocks if present
              translated = translated.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
              invalidReason = validateTranslatedJson(translated);
            } catch (err) {
               throw err;
            }
          } else {
            const sourceLinks = extractMdLinks(content);
            for (let attempt = 0; attempt < 3; attempt++) {
              const sourceLang = attempt === 0 ? guessSourceLang(content) : 'Chinese';
              const forceTargetLang = attempt >= 1;
              const candidateTargetLang = targetLangCandidates[attempt] || targetLangCandidates[0] || targetLang;
              const prompt = buildTranslationUserPrompt({ targetLang: candidateTargetLang, forceTargetLang });
              const fullPrompt = `${prompt}\n\n${content}`;
              
              try {
                translated = await requestWithRetry(() => requestTranslate(baseUrl, apiKey, model, fullPrompt));
                invalidReason = validateTranslatedDoc(translated, locale);

                if (!invalidReason) {
                  const translatedLinks = extractMdLinks(translated);
                  if (sourceLinks.length !== translatedLinks.length) {
                    invalidReason = `link_count_mismatch (src:${sourceLinks.length} vs tr:${translatedLinks.length})`;
                  } else {
                    translated = restoreMdLinks(translated, sourceLinks);
                  }
                }

                if (!invalidReason) break;
              } catch (err) {
                 if (attempt === 2) throw err;
              }
            }
            
            if (invalidReason === 'missing_title') {
              const titleLine = extractSourceTitleLine(content);
              if (titleLine) {
                translated = `${titleLine}\n\n${translated}`;
                invalidReason = validateTranslatedDoc(translated, locale);
              }
            }
          }

          if (invalidReason) throw new Error(`翻译输出不可用（${invalidReason}）：${translationRel}`);
          await fs.mkdir(path.dirname(trPathAbs), { recursive: true });
          await fs.writeFile(trPathAbs, translated, 'utf8');
          if (status === 'missing') counts.translatedMissing += 1;
          else counts.updatedOutdated += 1;

          if (args.limit !== 0) {
            if (status === 'missing') {
              printLine(`[TRANSLATED] locale=${locale} ${sourceRel} -> ${translationRel}`);
            } else {
              printLine(`[UPDATED] locale=${locale} ${sourceRel} -> ${translationRel}`);
            }
          }
        } catch (err) {
          counts.failed += 1;
          process.stderr.write(
            `[FAILED] locale=${locale} ${toPosixPath(path.join(args.sourceDir, relFromSource))} -> ${toPosixPath(
              path.join(args.i18nDir, locale, toPosixPath(args.pluginDocsSubdir), relFromSource),
            )}\n${err && err.stack ? err.stack : String(err)}\n`,
          );
        }
      });
    }
  }

  process.stdout.write(
    `\n[预检查完成] 待翻译任务: ${translationTasks.length}, 跳过: ${counts.skipped}\n开始执行翻译...\n\n`,
  );

  for (const task of translationTasks) {
    await schedule(task);
  }

  await Promise.all(active);

  for (const srcPathAbs of sourceFiles) {
    const relFromSource = path.relative(sourceDirAbs, srcPathAbs);
    for (const locale of locales) {
      const trPathAbs = path.join(i18nDirAbs, locale, args.pluginDocsSubdir, relFromSource);
      if (!(await fileExists(trPathAbs))) continue;
      await schedule(async () =>
        syncImagesForTranslationFile({
          repoRoot,
          srcDocPathAbs: srcPathAbs,
          trDocPathAbs: trPathAbs,
          counts,
          shouldPrint,
          printLine,
        }),
      );
    }
  }

  await Promise.all(active);

  process.stdout.write(
    `\nSummary: locales=${counts.locales} scanned=${counts.scannedSourceFiles} translatedMissing=${counts.translatedMissing} updatedOutdated=${counts.updatedOutdated} skipped=${counts.skipped} failed=${counts.failed} assetsCopied=${counts.assetsCopied} assetsSkippedExisting=${counts.assetsSkippedExisting} assetsMissingSource=${counts.assetsMissingSource} assetsFailed=${counts.assetsFailed} assetsSkippedNotRelative=${counts.assetsSkippedNotRelative} assetsSkippedOutsideRepo=${counts.assetsSkippedOutsideRepo}\n`,
  );
  if (counts.failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  process.stderr.write(`${err && err.stack ? err.stack : String(err)}\n`);
  process.exitCode = 1;
});
