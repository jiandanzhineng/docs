const fs = require('fs')
const path = require('path')

async function main() {
  const inPath = process.argv[2]
  const outPath = process.argv[3]
  if (!inPath || !outPath) {
    console.error('用法: node tool/translate-md.js <输入文件路径> <输出文件路径>')
    process.exit(1)
  }

  const envPath = path.resolve(__dirname, '..', '.env')
  const env = loadEnvFile(envPath)

  const apiKey =
    env.API_KEY ||
    env.OPENAI_API_KEY ||
    env.DEEPSEEK_API_KEY ||
    process.env.API_KEY ||
    process.env.OPENAI_API_KEY ||
    process.env.DEEPSEEK_API_KEY
  const baseUrl =
    env.API_BASE ||
    env.OPENAI_BASE_URL ||
    env.DEEPSEEK_API_BASE ||
    process.env.API_BASE ||
    process.env.OPENAI_BASE_URL ||
    process.env.DEEPSEEK_API_BASE ||
    inferDefaultApiBase({ hasOpenAIKey: !!(env.OPENAI_API_KEY || process.env.OPENAI_API_KEY), hasDeepSeekKey: !!(env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY) })
  const model =
    env.MODEL ||
    env.OPENAI_MODEL ||
    env.DEEPSEEK_MODEL ||
    process.env.MODEL ||
    process.env.OPENAI_MODEL ||
    process.env.DEEPSEEK_MODEL ||
    inferDefaultModel(baseUrl)
  if (!baseUrl || !apiKey) {
    console.error(
      '缺少 API_BASE/API_KEY（或 OPENAI_BASE_URL/OPENAI_API_KEY、DEEPSEEK_API_BASE/DEEPSEEK_API_KEY）。可在 .env 或系统环境变量中设置。'
    )
    process.exit(1)
  }

  const content = fs.readFileSync(path.resolve(inPath), 'utf8')
  // 清除所有 <font> </font> 标签
  content = content.replace(/<font.*?>.*?<\/font>/g, '')
  const targetLang = detectTargetLanguage(outPath)
  const prompt =
    `将以下内容翻译为${targetLang}，不要翻译超链接中的引用标记(就是[]后紧跟的括号内容,这部分用于标识超链接的目标，要保持原样！)` +
    `，仅输出翻译结果，不要输出其他内容。注意保留markdown格式。` +
    `要翻译的内容如下：\n${content}`

  const normalizedBaseUrl = normalizeBaseUrl(baseUrl)
  const text = await requestTranslate(normalizedBaseUrl, apiKey, model, prompt)

  fs.mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true })
  fs.writeFileSync(path.resolve(outPath), text, 'utf8')
}

if (require.main === module) {
  main().catch((e) => {
    console.error(formatError(e))
    process.exit(1)
  })
}

module.exports = {
  requestTranslate,
  formatError,
  loadEnvFile,
  inferDefaultApiBase,
  inferDefaultModel,
  normalizeBaseUrl
}

async function requestTranslate(baseUrl, apiKey, model, prompt) {
  const tryResponses = async () => {
    const url = buildV1Url(baseUrl, 'responses')
    model = model || 'DeepSeek-V3.2'
    const body = { model, input: prompt }
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(body)
    })
    if (!r.ok) {
      const t = await safeReadText(r)
      throw new Error(`HTTP ${r.status} ${r.statusText}${t ? `: ${t}` : ''}`)
    }
    const j = await r.json()
    const t = extractText(j)
    if (!t) throw new Error('responses 接口返回成功，但未解析到文本')
    return t
  }
  const tryCompletions = async () => {
    const url = buildV1Url(baseUrl, 'chat/completions')
    const body = { model, messages: [{ role: 'user', content: prompt }], stream: false }
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(body)
    })
    if (!r.ok) {
      const t = await safeReadText(r)
      throw new Error(`HTTP ${r.status} ${r.statusText}${t ? `: ${t}` : ''}`)
    }
    const j = await r.json()
    const t =
      (j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) ||
      extractText(j) ||
      ''
    if (!t) throw new Error('chat/completions 接口返回成功，但未解析到文本')
    return t
  }
  let s = ''
  let err1 = ''
  let err2 = ''
  try { s = await tryResponses() } catch (e) { err1 = formatError(e) }
  if (!s) {
    try { s = await tryCompletions() } catch (e) { err2 = formatError(e) }
  }
  if (!s) throw new Error(err2 || err1 || '未获取到翻译结果')
  return s
}

function extractText(j) {
  if (!j) return ''
  if (j.output_text) return j.output_text
  if (Array.isArray(j.output)) {
    const first = j.output[0]
    if (first && Array.isArray(first.content)) {
      const t = first.content.map((c) => c.text || '').join('')
      if (t) return t
    }
  }
  if (Array.isArray(j.content)) {
    const t = j.content.map((c) => c.text || '').join('')
    if (t) return t
  }
  return ''
}

function loadEnvFile(envPath) {
  const env = {}
  let envText = ''
  try {
    envText = fs.readFileSync(envPath, 'utf8')
  } catch (_) {
    envText = ''
  }

  envText.split(/\r?\n/).forEach((rawLine) => {
    const line = String(rawLine || '').trim()
    if (!line || line.startsWith('#')) return
    const m = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
    if (!m) return
    const k = m[1]
    const v = stripQuotes(m[2])
    env[k] = v
  })
  return env
}

function stripQuotes(s) {
  const t = String(s || '')
  const m = t.match(/^"(.*)"$/) || t.match(/^'(.*)'$/)
  return m ? m[1] : t
}

function inferDefaultApiBase({ hasOpenAIKey, hasDeepSeekKey }) {
  if (hasDeepSeekKey) return 'https://api.deepseek.com'
  if (hasOpenAIKey) return 'https://www.dmxapi.cn/v1'
  return ''
}

function inferDefaultModel(apiBase) {
  return 'DeepSeek-V3.2'
}

function normalizeBaseUrl(baseUrl) {
  return String(baseUrl || '').replace(/\/+$/, '')
}

function buildV1Url(baseUrl, pathAfterV1) {
  const b = normalizeBaseUrl(baseUrl)
  const p = String(pathAfterV1 || '').replace(/^\/+/, '')
  if (!b) return ''
  if (b.endsWith('/v1')) return `${b}/${p}`
  return `${b}/v1/${p}`
}

async function safeReadText(r) {
  try {
    return await r.text()
  } catch (_) {
    return ''
  }
}

function formatError(e) {
  const parts = []
  if (e && e.message) parts.push(String(e.message))
  else parts.push(String(e))
  const cause = e && e.cause
  if (cause) {
    if (cause.message) parts.push(String(cause.message))
    else parts.push(String(cause))
  }
  return parts.join('\n')
}

function detectTargetLanguage(p) {
  const s = (p || '').toLowerCase()
  if (s.includes('zh-hans') || s.includes('.zh') || s.includes('/zh/')) return '简体中文'
  if (s.includes('en')) return '英语'
  if (s.includes('ja')) return '日语'
  if (s.includes('de')) return '德语'
  if (s.includes('es')) return '西班牙语'
  return '中文'
}
