/**
 * prune-orphan-translations.js — 删除 i18n 里「没有 docs/ 源对应物」的翻译文件/目录。
 *
 * 背景：源文档搬迁 / 重命名 / 删除后，旧的 i18n 译文不会自动跟着消失，久而久之在各
 * locale 下堆积出 docs/ 里已不存在的孤儿（如 game/、（电脑版）控制客户端/、顶层散落的
 * 旧 .md 等），既产生过时重复路由，又可能被误当现行内容。本工具按「docs/ 是唯一真相」
 * 的原则：i18n/<locale>/docusaurus-plugin-content-docs/current/ 下每个文件，若 docs/ 里
 * 不存在同相对路径的源文件，即为孤儿，予以删除，并清理随之变空的目录。
 *
 * 用法：
 *   node tool/prune-orphan-translations.js --dry-run   # 只列出，不删（提交前先跑这个）
 *   node tool/prune-orphan-translations.js             # 实际删除
 *   node tool/prune-orphan-translations.js --locale en # 只处理 en
 *
 * 已接入 `npm run translate` 链（翻译完自动清理）。退出码：删除/将删除孤儿 > 0 时为 1
 * （dry-run 时），实际删除成功为 0；目的是让 dry-run 在 CI 里能被注意到。
 */

const fs = require('node:fs/promises');
const path = require('node:path');

const PLUGIN_DOCS_SUBDIR = path.join('docusaurus-plugin-content-docs', 'current');

function toPosixPath(p) {
  return p.split(path.sep).join('/');
}

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

// 收集 docs/ 下所有文件的相对路径（posix），作为「源清单」
async function collectSourceManifest(sourceDirAbs) {
  const set = new Set();
  for await (const f of walkFiles(sourceDirAbs)) {
    set.add(toPosixPath(path.relative(sourceDirAbs, f)));
  }
  return set;
}

// 自底向上删除变空的目录（限定在 rootAbs 之内）
async function pruneEmptyDirs(rootAbs) {
  let removed = 0;
  // 多轮，因为删掉一层后上一层可能也空了
  for (let pass = 0; pass < 10; pass++) {
    let anyRemoved = false;
    // 收集 rootAbs 下所有子目录
    const dirs = [];
    const stack = [rootAbs];
    while (stack.length) {
      const cur = stack.pop();
      let entries;
      try {
        entries = await fs.readdir(cur, { withFileTypes: true });
      } catch {
        continue;
      }
      for (const e of entries) {
        if (e.isDirectory()) stack.push(path.join(cur, e.name));
      }
      if (cur !== rootAbs) dirs.push(cur);
    }
    for (const d of dirs) {
      if (d === rootAbs) continue;
      let entries;
      try {
        entries = await fs.readdir(d);
      } catch {
        continue;
      }
      if (entries.length === 0) {
        try {
          await fs.rmdir(d);
          removed++;
          anyRemoved = true;
        } catch {
          /* 忽略 */
        }
      }
    }
    if (!anyRemoved) break;
  }
  return removed;
}

function parseArgs(argv) {
  const args = {
    sourceDir: 'docs',
    i18nDir: 'i18n',
    locales: null,
    dryRun: false,
    help: false,
  };
  const takeValue = (i) => {
    if (i + 1 >= argv.length) throw new Error(`缺少参数值：${argv[i]}`);
    return argv[i + 1];
  };
  for (let i = 2; i < argv.length; i++) {
    const t = argv[i];
    if (t === '--help' || t === '-h') args.help = true;
    else if (t === '--dry-run' || t === '-n') args.dryRun = true;
    else if (t === '--source-dir') (args.sourceDir = takeValue(i)), i++;
    else if (t === '--i18n-dir') (args.i18nDir = takeValue(i)), i++;
    else if (t === '--locale' || t === '--locales') {
      args.locales = takeValue(i)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
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
      '用法: node tool/prune-orphan-translations.js [选项]',
      '',
      '删除 i18n/<locale>/docusaurus-plugin-content-docs/current/ 下、docs/ 里已无对应源文件的',
      '翻译文件 / 目录（搬迁 / 删除源文档后留下的孤儿译文）。',
      '',
      '选项:',
      '  --source-dir <dir>   默认源目录 (默认 docs)',
      '  --i18n-dir <dir>     i18n 根目录 (默认 i18n)',
      '  --locale <a,b>       只处理指定 locale (逗号分隔)，默认全部',
      '  --dry-run, -n        只列出孤儿、不删除',
      '  -h, --help           显示本帮助',
      '',
    ].join('\n'),
  );
}

async function listLocales(i18nDirAbs) {
  try {
    const entries = await fs.readdir(i18nDirAbs, { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).map((e) => e.name).sort();
  } catch {
    return [];
  }
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

  const manifest = await collectSourceManifest(sourceDirAbs);
  const allLocales = await listLocales(i18nDirAbs);
  const locales = args.locales
    ? args.locales.filter((l) => allLocales.includes(l))
    : allLocales.filter((l) => l !== 'zh-Hans'); // zh-Hans 用 docs/，不在此处理

  const tag = args.dryRun ? 'ORPHAN' : 'PRUNED';
  let totalOrphans = 0;
  let totalDirs = 0;

  for (const locale of locales) {
    const currentAbs = path.join(i18nDirAbs, locale, PLUGIN_DOCS_SUBDIR);
    let localeOrphans = 0;
    for await (const f of walkFiles(currentAbs)) {
      const rel = toPosixPath(path.relative(currentAbs, f));
      if (manifest.has(rel)) continue; // docs/ 里有对应源文件，保留
      localeOrphans++;
      totalOrphans++;
      const relRepo = toPosixPath(path.relative(repoRoot, f));
      process.stdout.write(`  [${tag}] ${relRepo}\n`);
      if (!args.dryRun) {
        try {
          await fs.rm(f, { force: true });
        } catch (err) {
          process.stderr.write(`  删除失败 ${relRepo}: ${err}\n`);
        }
      }
    }
    if (localeOrphans > 0 && !args.dryRun) {
      const removed = await pruneEmptyDirs(currentAbs);
      totalDirs += removed;
    }
    process.stdout.write(`  ${locale}: ${localeOrphans} 个孤儿${args.dryRun ? '（dry-run 未删）' : ' 已删'}\n`);
  }

  process.stdout.write(
    `\n合计: ${totalOrphans} 个孤儿文件${args.dryRun ? '（dry-run）' : totalDirs ? `，另清理 ${totalDirs} 个空目录` : ''}。\n`,
  );
  // dry-run 发现孤儿时返回 1，便于 CI 把 dry-run 当门槛
  if (args.dryRun && totalOrphans > 0) process.exitCode = 1;
}

main().catch((err) => {
  process.stderr.write(`${err && err.stack ? err.stack : String(err)}\n`);
  process.exitCode = 1;
});
