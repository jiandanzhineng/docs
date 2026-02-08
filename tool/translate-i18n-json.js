const fs = require('node:fs/promises');
const path = require('node:path');
const {requestTranslate, normalizeBaseUrl, formatError} = require('./translate-md');

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

function parseArgs(argv) {
  const args = {
    docsDir: 'docs',
    i18nDir: 'i18n',
    defaultLocale: 'zh-Hans',
    includeDefaultLocale: false,
    locales: null,
    apiKey: null,
    baseUrl: null,
    model: null,
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
    if (token === '--help' || token === '-h') {
      args.help = true;
      continue;
    }

    const [k, v] = token.includes('=') ? token.split(/=(.*)/s) : [token, null];
    const key = k;
    const value = v ?? takeValue(i++);

    switch (key) {
      case '--docs-dir':
        args.docsDir = value;
        break;
      case '--i18n-dir':
        args.i18nDir = value;
        break;
      case '--default-locale':
        args.defaultLocale = value;
        break;
      case '--locale':
      case '--locales':
        args.locales = value.split(',').map((s) => s.trim()).filter(Boolean);
        break;
      case '--api-key':
        args.apiKey = value;
        break;
      case '--base-url':
        args.baseUrl = value;
        break;
      case '--model':
        args.model = value;
        break;
      default:
        throw new Error(`未知参数：${token}`);
    }
  }

  return args;
}

async function listLocales(i18nDirAbs) {
  const entries = await fs.readdir(i18nDirAbs, {withFileTypes: true});
  return entries.filter((e) => e.isDirectory()).map((e) => e.name);
}

async function* walkFiles(dirAbs) {
  const entries = await fs.readdir(dirAbs, {withFileTypes: true});
  for (const entry of entries) {
    const fullPath = path.join(dirAbs, entry.name);
    if (entry.isDirectory()) yield* walkFiles(fullPath);
    else if (entry.isFile()) yield fullPath;
  }
}

function buildChromeI18nPrompt({targetLang}) {
  return [
    '你是一个专业的软件国际化翻译助手。',
    `请将以下 JSON（Chrome i18n 格式）中每个条目的 "message" 字段翻译为 ${targetLang}。`,
    '保持 JSON 结构完全不变，不要修改 key，不要修改 "description" 字段，不要添加额外字段。',
    '只输出翻译后的 JSON 字符串，不要包含 Markdown 代码块标记（如 ```json ... ```）。',
  ].join('\n');
}

function stripJsonCodeFence(text) {
  return String(text || '')
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

function isChromeI18nJsonObject(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false;
  const keys = Object.keys(obj);
  if (keys.length === 0) return false;
  const sample = obj[keys[0]];
  return !!(sample && typeof sample === 'object' && !Array.isArray(sample) && Object.prototype.hasOwnProperty.call(sample, 'message'));
}

async function buildCategoryLabelMap({repoRoot, docsDirAbs, i18nDirAbs, locale, pluginDocsSubdir}) {
  const map = new Map();
  for await (const srcPathAbs of walkFiles(docsDirAbs)) {
    if (path.basename(srcPathAbs) !== '_category_.json') continue;
    const rel = path.relative(docsDirAbs, srcPathAbs);
    const trPathAbs = path.join(i18nDirAbs, locale, pluginDocsSubdir, rel);
    let src;
    let tr;
    try {
      src = JSON.parse(await fs.readFile(srcPathAbs, 'utf8'));
    } catch {
      continue;
    }
    try {
      tr = JSON.parse(await fs.readFile(trPathAbs, 'utf8'));
    } catch {
      continue;
    }
    const srcLabel = src && typeof src.label === 'string' ? src.label.trim() : '';
    const trLabel = tr && typeof tr.label === 'string' ? tr.label.trim() : '';
    if (srcLabel && trLabel) map.set(srcLabel, trLabel);
  }
  return map;
}

function applyCategoryLabelsToDocsCurrentJson({jsonObj, labelMap}) {
  for (const [key, value] of Object.entries(jsonObj)) {
    if (!key.includes('.category.')) continue;
    if (!value || typeof value !== 'object' || Array.isArray(value)) continue;
    const idx = key.indexOf('.category.');
    const srcLabel = key.slice(idx + '.category.'.length);
    const translatedLabel = labelMap.get(srcLabel);
    if (translatedLabel) {
      value.message = translatedLabel;
    }
  }
}

async function translateChromeI18nFile({srcFilePath, destFilePath, locale, baseUrl, apiKey, model}) {
  const raw = await fs.readFile(srcFilePath, 'utf8');
  let jsonObj;
  try {
    jsonObj = JSON.parse(raw);
  } catch {
    return false;
  }
  if (!isChromeI18nJsonObject(jsonObj)) return false;

  const targetLang = localeToTargetLang(locale);
  const prompt = buildChromeI18nPrompt({targetLang});
  const fullPrompt = `${prompt}\n\n${raw}`;
  const translatedRaw = await requestTranslate(baseUrl, apiKey, model, fullPrompt);
  const clean = stripJsonCodeFence(translatedRaw);
  JSON.parse(clean);

  await fs.mkdir(path.dirname(destFilePath), {recursive: true});
  await fs.writeFile(destFilePath, clean + '\n', 'utf8');
  return true;
}

function printHelp() {
  process.stdout.write(
    [
      '用法: node tool/translate-i18n-json.js [options]',
      '',
      '选项:',
      '  --docs-dir <dir>       源 docs 目录（默认 docs）',
      '  --i18n-dir <dir>       i18n 目录（默认 i18n）',
      '  --locales <list>       仅处理指定 locale（逗号分隔）',
      '  --include-default-locale  处理 defaultLocale（默认不处理）',
      '  --default-locale <loc> defaultLocale（默认 zh-Hans）',
      '  --api-key <key>        覆盖 OPENAI_API_KEY',
      '  --base-url <url>       覆盖 OPENAI_BASE_URL（默认 https://www.dmxapi.cn/v1）',
      '  --model <name>         覆盖 OPENAI_MODEL（默认 DeepSeek-V3.2）',
      '',
      '说明:',
      '  - 会翻译 i18n/<locale> 下的 code.json、navbar.json、footer.json、docs/current.json、blog/options.json（若存在）',
      "  - docs/current.json 的 sidebar category 会优先从 i18n/<locale>/.../_category_.json 同步 label",
      '  - 支持并行处理 (5个) 和错误自动重试 (3次)',
      '',
    ].join('\n'),
  );
}

async function runWithRetry(fn, maxRetries = 3) {
  let lastError;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      if (i === maxRetries) break;
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  throw lastError;
}

async function main() {
  const repoRoot = path.resolve(__dirname, '..');
  await loadDotEnvIfPresent(repoRoot);

  const args = parseArgs(process.argv);
  if (args.help) {
    printHelp();
    return;
  }

  const docsDirAbs = path.resolve(repoRoot, args.docsDir);
  const i18nDirAbs = path.resolve(repoRoot, args.i18nDir);
  const pluginDocsSubdir = path.join('docusaurus-plugin-content-docs', 'current');

  const defaultLocale = args.defaultLocale;
  const locales = args.locales || (await listLocales(i18nDirAbs));
  const targetLocales = args.includeDefaultLocale ? locales : locales.filter((l) => l !== defaultLocale);

  const baseUrl = normalizeBaseUrl(args.baseUrl || process.env.OPENAI_BASE_URL || process.env.API_BASE || 'https://www.dmxapi.cn/v1');
  const apiKey = args.apiKey || process.env.OPENAI_API_KEY || process.env.DMX_API_KEY || process.env.API_KEY || '';
  const model = args.model || process.env.OPENAI_MODEL || 'DeepSeek-V3.2';

  const filesRel = [
    path.join('docusaurus-plugin-content-docs', 'current.json'),
    path.join('docusaurus-theme-classic', 'navbar.json'),
    path.join('docusaurus-theme-classic', 'footer.json'),
    path.join('docusaurus-plugin-content-blog', 'options.json'),
    'code.json',
  ];

  const tasks = [];
  process.stdout.write('Generating translation tasks...\n');

  for (const locale of targetLocales) {
    const labelMap = await buildCategoryLabelMap({repoRoot, docsDirAbs, i18nDirAbs, locale, pluginDocsSubdir});

    for (const rel of filesRel) {
      const srcFilePath = path.join(i18nDirAbs, defaultLocale, rel);
      const destFilePath = path.join(i18nDirAbs, locale, rel);
      try {
        await fs.access(srcFilePath);
        tasks.push({
          locale,
          rel,
          srcFilePath,
          destFilePath,
          labelMap,
          baseUrl,
          apiKey,
          model,
        });
      } catch {
        // ignore
      }
    }
  }

  const total = tasks.length;
  if (total === 0) {
    console.log('No files to process.');
    return;
  }

  console.log(`Found ${total} files to process.`);

  const CONCURRENCY = 5;
  let completedCount = 0;

  const processTask = async (task) => {
    const {locale, rel, srcFilePath, destFilePath, labelMap, apiKey, baseUrl, model} = task;
    const taskName = `${locale} ${rel}`;

    if (apiKey) {
      try {
        const start = Date.now();
        await runWithRetry(() => translateChromeI18nFile({srcFilePath, destFilePath, locale, baseUrl, apiKey, model}), 3);
        const cost = ((Date.now() - start) / 1000).toFixed(1);
        completedCount++;
        process.stdout.write(`[${completedCount}/${total}] Translated ${taskName} (${cost}s)\n`);
      } catch (e) {
        completedCount++;
        process.stderr.write(`[${completedCount}/${total}] [FAILED] ${taskName}: ${formatError(e)}\n`);
      }
    } else {
      completedCount++;
    }

    if (rel === path.join('docusaurus-plugin-content-docs', 'current.json')) {
      try {
        const obj = JSON.parse(await fs.readFile(destFilePath, 'utf8'));
        if (isChromeI18nJsonObject(obj) && labelMap.size > 0) {
          applyCategoryLabelsToDocsCurrentJson({jsonObj: obj, labelMap});
          await fs.writeFile(destFilePath, JSON.stringify(obj, null, 2) + '\n', 'utf8');
        }
      } catch (e) {
        // ignore
      }
    }
  };

  const queue = [...tasks];
  const workers = Array.from({length: Math.min(CONCURRENCY, tasks.length)}, async () => {
    while (queue.length > 0) {
      const task = queue.shift();
      if (task) await processTask(task);
    }
  });

  await Promise.all(workers);
  console.log('All tasks completed.');
}

if (require.main === module) {
  main().catch((e) => {
    process.stderr.write(`${formatError(e)}\n`);
    process.exit(1);
  });
}
