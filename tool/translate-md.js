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
  const envText = fs.readFileSync(envPath, 'utf8')
  const env = {}
  envText.split(/\r?\n/).forEach((line) => {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)\s*$/)
    if (m) env[m[1]] = m[2]
  })

  const apiBase = env.API_BASE
  const apiKey = env.API_KEY
  if (!apiBase || !apiKey) {
    console.error('缺少API_BASE或API_KEY')
    process.exit(1)
  }

  const content = fs.readFileSync(path.resolve(inPath), 'utf8')
  const targetLang = detectTargetLanguage(outPath)
  const prompt =
    `将以下内容翻译为【${targetLang}】，不要翻译超链接中的引用标记，仅输出翻译结果，不要输出其他内容。` +
    `要翻译的内容如下：【${content}】`

  const base = apiBase.replace(/\/+$/, '')
  const text = await requestTranslate(base, apiKey, prompt)

  fs.mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true })
  fs.writeFileSync(path.resolve(outPath), text || content, 'utf8')
}

async function requestTranslate(base, apiKey, prompt) {
  const tryResponses = async () => {
    const url = base + '/v1/responses'
    const body = { model: 'DeepSeek-V3.2', input: prompt }
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(body)
    })
    const j = await r.json()
    return extractText(j)
  }
  const tryCompletions = async () => {
    const url = base + '/v1/chat/completions'
    const body = { model: 'DeepSeek-V3.2', messages: [{ role: 'user', content: prompt }], stream: false }
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(body)
    })
    const j = await r.json()
    return (
      (j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) ||
      extractText(j) ||
      ''
    )
  }
  let s = ''
  try { s = await tryResponses() } catch (_) {}
  if (!s) {
    try { s = await tryCompletions() } catch (_) {}
  }
  return s || ''
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

function detectTargetLanguage(p) {
  const s = (p || '').toLowerCase()
  if (s.includes('zh-hans') || s.includes('.zh') || s.includes('/zh/')) return '简体中文'
  if (s.includes('en')) return '英语'
  if (s.includes('ja')) return '日语'
  if (s.includes('de')) return '德语'
  if (s.includes('es')) return '西班牙语'
  return '中文'
}

main().catch((e) => {
  console.error(e && e.message ? e.message : String(e))
  process.exit(1)
})
