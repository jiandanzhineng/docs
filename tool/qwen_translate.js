const fs = require('fs');
const path = require('path');

const API_KEY = '';
const URL = 'https://www.dmxapi.cn/v1/chat/completions';
const MODEL = 'qwen-mt-plus';

/**
 * 翻译文本函数
 * @param {string} text - 待翻译文本
 * @param {string} targetLang - 目标语言
 * @param {string} sourceLang - 源语言
 * @returns {Promise<string>} - 翻译后的文本
 */
async function translate(text, targetLang = 'English', sourceLang = 'auto') {
  try {
    const response = await fetch(URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'user',
            content: text
          }
        ],
        translation_options: {
          source_lang: sourceLang,
          target_lang: targetLang
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const data = await response.json();
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
    } else {
      throw new Error(`Translation failed: ${JSON.stringify(data)}`);
    }
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
}

// 命令行调用逻辑
if (require.main === module) {
  const filePath = process.argv[2];
  const targetDir = process.argv[3] || 'test';
  
  if (!filePath) {
    console.log('Usage: node qwen_translate.js <file_path> [target_dir]');
    process.exit(1);
  }

  const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
  
  if (!fs.existsSync(absolutePath)) {
    console.error(`File not found: ${absolutePath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(absolutePath, 'utf-8');
  const fileName = path.basename(filePath);
  const targetPath = path.join(path.isAbsolute(targetDir) ? targetDir : path.resolve(process.cwd(), targetDir), fileName);

  const finalTargetDir = path.dirname(targetPath);
  if (!fs.existsSync(finalTargetDir)) {
    fs.mkdirSync(finalTargetDir, { recursive: true });
  }

  console.log(`Translating ${absolutePath} to English...`);
  translate(content)
    .then(translated => {
      fs.writeFileSync(targetPath, translated, 'utf-8');
      console.log(`Successfully saved translated file to: ${targetPath}`);
    })
    .catch(err => {
      console.error('Failed to translate file:', err.message);
      process.exit(1);
    });
}

module.exports = { translate };
