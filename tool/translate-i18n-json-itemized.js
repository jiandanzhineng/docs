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
    concurrency: 10,
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
      case '--concurrency':
        args.concurrency = parseInt(value, 10) || 10;
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

function printHelp() {
  process.stdout.write(
    [
      '用法: node tool/translate-i18n-json-itemized.js [options]',
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
      '  --concurrency <num>    并发数（默认 10）',
      '',
      '说明:',
      '  - 逐条翻译 i18n JSON 文件中的 message',
      '  - 支持文件: code.json, navbar.json, footer.json, docs/current.json, blog/options.json',
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

async function translateItem({key, message, description, targetLang, baseUrl, apiKey, model}) {
  const prompt = [
    `你是一个专业的软件国际化翻译助手。`,
    `请将以下文本翻译为 ${targetLang}。`,
    description ? `上下文描述: ${description}` : '',
    `原文: "${message}"`,
    `请仅输出翻译后的文本，不要包含任何引号、Markdown 标记或额外解释。`,
  ].filter(Boolean).join('\n');

  const translatedText = await requestTranslate(baseUrl, apiKey, model, prompt);
  // 清理可能存在的首尾引号（如果模型不听话）
  let clean = translatedText.trim();
  if (clean.startsWith('"') && clean.endsWith('"') && clean.length >= 2) {
    clean = clean.slice(1, -1);
  }
  return clean;
}

async function main() {
  const repoRoot = path.resolve(__dirname, '..');
  await loadDotEnvIfPresent(repoRoot);

  const args = parseArgs(process.argv);
  if (args.help) {
    printHelp();
    return;
  }

  const i18nDirAbs = path.resolve(repoRoot, args.i18nDir);
  const defaultLocale = args.defaultLocale;
  const sourceLocale = 'zh-Hans'; // 强制使用 zh-Hans 作为源语言
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

  if (!apiKey) {
    console.error('未找到 API Key，请设置 OPENAI_API_KEY 环境变量或使用 --api-key 参数。');
    process.exit(1);
  }

  for (const locale of targetLocales) {
    const targetLang = localeToTargetLang(locale);
    console.log(`\n=== Processing Locale: ${locale} (Target: ${targetLang}, Source: ${sourceLocale}) ===`);

    for (const rel of filesRel) {
      const srcFilePathAbs = path.join(i18nDirAbs, sourceLocale, rel);
      const destFilePathAbs = path.join(i18nDirAbs, locale, rel);

      let srcObj;
      try {
        const raw = await fs.readFile(srcFilePathAbs, 'utf8');
        srcObj = JSON.parse(raw);
      } catch (e) {
        console.warn(`[WARN] Source file not found or invalid: ${srcFilePathAbs}`);
        continue;
      }

      let destObj = {};
      try {
        const raw = await fs.readFile(destFilePathAbs, 'utf8');
        destObj = JSON.parse(raw);
      } catch (e) {
        // 目标文件不存在，使用空对象
      }

      const tasks = [];
      const keys = Object.keys(srcObj);
      const newDestObj = {}; // 用于重组的新对象，保持源文件顺序

      for (const key of keys) {
        const srcVal = srcObj[key];
        if (!srcVal || typeof srcVal !== 'object' || typeof srcVal.message !== 'string') {
          continue;
        }

        // 默认将源内容放入新对象
        newDestObj[key] = { ...srcVal }; // 复制 description 等字段
        
        // 检查目标文件是否已有翻译
        const existingVal = destObj[key];
        if (existingVal && existingVal.message && existingVal.message.trim()) {
           // 已存在且非空，保留原有翻译
           newDestObj[key].message = existingVal.message;
        } else {
           // 需要翻译
           tasks.push({
             key,
             message: srcVal.message,
             description: srcVal.description,
           });
        }
      }

      if (tasks.length === 0) {
        console.log(`[${locale}] [${rel}] All messages exist. Writing reassembled file...`);
        // 即使没有任务，也要写入以确保结构一致
        await fs.mkdir(path.dirname(destFilePathAbs), { recursive: true });
        await fs.writeFile(destFilePathAbs, JSON.stringify(newDestObj, null, 2) + '\n', 'utf8');
        continue;
      }

      console.log(`[${locale}] [${rel}] Found ${tasks.length} messages to translate.`);

      let completedCount = 0;
      const total = tasks.length;
      
      const processTask = async (task) => {
        try {
            if (!task.message.trim()) return;

            const translated = await runWithRetry(() => translateItem({
                key: task.key,
                message: task.message,
                description: task.description,
                targetLang,
                baseUrl,
                apiKey,
                model
            }));
            
            newDestObj[task.key].message = translated;
            completedCount++;
            console.log(`[${locale}] [${rel}] [${completedCount}/${total}] Translated: "${task.message.substring(0, 20)}${task.message.length > 20 ? '...' : ''}" -> "${translated.substring(0, 20)}${translated.length > 20 ? '...' : ''}"`);
        } catch (e) {
            completedCount++;
            console.error(`[${locale}] [${rel}] [${completedCount}/${total}] [FAILED] Key: ${task.key}, Error: ${formatError(e)}`);
            // 失败时保留原文，避免数据丢失
            newDestObj[task.key].message = task.message;
        }
      };

      const queue = [...tasks];
      const workers = Array.from({length: Math.min(args.concurrency, tasks.length)}, async () => {
        while (queue.length > 0) {
          const task = queue.shift();
          if (task) await processTask(task);
        }
      });

      await Promise.all(workers);

      // Write back
      await fs.mkdir(path.dirname(destFilePathAbs), { recursive: true });
      await fs.writeFile(destFilePathAbs, JSON.stringify(newDestObj, null, 2) + '\n', 'utf8');
      console.log(`[${locale}] [${rel}] Saved.`);
    }
  }
  
  console.log('\nAll tasks completed.');
}

if (require.main === module) {
  main().catch((e) => {
    console.error(formatError(e));
    process.exit(1);
  });
}
