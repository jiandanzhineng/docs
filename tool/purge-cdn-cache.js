/**
 * purge-cdn-cache.js — 刷新 docs.undersilicon.cn 的阿里云 ESA 节点缓存。
 *
 * 背景：ESA 对 HTML 按 `Cache-Control: max-age=86400` 缓存 24 小时，仓库里没有
 * 自动刷新配置。改完文档推上去，进过缓存的页面最多要等一天才更新；CSS/JS 是内容
 * 哈希文件名不受影响，受影响的是 HTML 本身。跑这个脚本可以立刻失效。
 *
 * 用法：
 *   node tool/purge-cdn-cache.js            # 刷新整站（目录刷新）
 *   node tool/purge-cdn-cache.js --quota    # 只看剩余配额
 *
 * 凭据：环境变量 ALIYUN_ACCESS_KEY_ID / ALIYUN_ACCESS_KEY_SECRET，
 *       没设就回退读 E:\smart\.env 里的 OSS_ACCESS_KEY_ID / OSS_ACCESS_KEY_SECRET。
 *
 * 注意：ESA 站点是整个 `undersilicon.cn` 区域，`purgeall` 会把 shop.undersilicon.cn
 * 也一起清掉，所以这里只用目录刷新，作用域限定在 docs 域名下。`hostname` 刷新在
 * 当前套餐配额为 0，用不了。
 */
const crypto = require('node:crypto');
const fs = require('node:fs');

const ENDPOINT = 'https://esa.cn-hangzhou.aliyuncs.com';
const VERSION = '2024-09-10';
const SITE_ID = 153407674562800;
const DOCS_ORIGIN = 'https://docs.undersilicon.cn/';

function loadCreds() {
  if (process.env.ALIYUN_ACCESS_KEY_ID && process.env.ALIYUN_ACCESS_KEY_SECRET) {
    return {
      id: process.env.ALIYUN_ACCESS_KEY_ID,
      secret: process.env.ALIYUN_ACCESS_KEY_SECRET,
    };
  }
  const env = fs.readFileSync('E:/smart/.env', 'utf8');
  const pick = (key) => {
    const m = env.match(new RegExp(`^${key}\\s*=\\s*(.+)$`, 'm'));
    return m ? m[1].trim().replace(/^["']|["']$/g, '') : '';
  };
  const id = pick('OSS_ACCESS_KEY_ID');
  const secret = pick('OSS_ACCESS_KEY_SECRET');
  if (!id || !secret) throw new Error('没读到阿里云 AccessKey');
  return { id, secret };
}

const percentEncode = (value) =>
  encodeURIComponent(value).replace(/\+/g, '%20').replace(/\*/g, '%2A').replace(/%7E/g, '~');

// ESA 是 RPC 风格签名 v1。注意每个 action 允许的 HTTP 方法不同：ListSites、
// GetPurgeQuota 只收 GET，PurgeCaches 只收 POST，搞错会返回 UnsupportedHTTPMethod。
async function call(action, params = {}, method = 'GET') {
  const { id, secret } = loadCreds();
  const all = {
    Format: 'JSON',
    Version: VERSION,
    AccessKeyId: id,
    SignatureMethod: 'HMAC-SHA1',
    SignatureVersion: '1.0',
    SignatureNonce: crypto.randomUUID(),
    Timestamp: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    Action: action,
    ...params,
  };

  const canonical = Object.keys(all)
    .sort()
    .map((k) => `${percentEncode(k)}=${percentEncode(all[k])}`)
    .join('&');
  all.Signature = crypto
    .createHmac('sha1', `${secret}&`)
    .update(`${method}&${percentEncode('/')}&${percentEncode(canonical)}`)
    .digest('base64');

  const body = new URLSearchParams(all).toString();
  const res = await fetch(method === 'POST' ? ENDPOINT : `${ENDPOINT}/?${body}`, {
    method,
    ...(method === 'POST'
      ? {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body,
        }
      : {}),
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch (error) {
    json = { raw: text.slice(0, 400) };
  }
  if (!res.ok) throw new Error(`${res.status} ${json.Code || ''} ${json.Message || ''}`.trim());
  return json;
}

async function showQuota() {
  for (const type of ['directory', 'file', 'purgeall', 'hostname']) {
    const q = await call('GetPurgeQuota', { SiteId: String(SITE_ID), Type: type });
    console.log(`  ${type.padEnd(10)} 配额 ${q.Quota} / 近 30 天已用 ${q.Usage30Day}`);
  }
}

async function purge() {
  const r = await call(
    'PurgeCaches',
    {
      SiteId: String(SITE_ID),
      Type: 'directory',
      Force: 'true',
      Content: JSON.stringify({ Directories: [DOCS_ORIGIN] }),
    },
    'POST'
  );
  console.log(`已提交刷新任务 TaskId=${r.TaskId}，作用域 ${DOCS_ORIGIN}，约 1 分钟生效。`);
}

async function main() {
  if (process.argv.includes('--quota')) {
    console.log('ESA 刷新配额：');
    await showQuota();
    return;
  }
  await purge();
}

main().catch((error) => {
  console.error('刷新失败：', error.message);
  process.exit(1);
});
