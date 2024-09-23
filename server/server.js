// server/server.js
const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

const app = express();
app.use(cors({ origin: 'https://english-ba502.web.app' }));
app.use(express.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

if (!configuration.apiKey) {
  console.error('OpenAI APIキーが設定されていません。');
  process.exit(1);
}

const openai = new OpenAIApi(configuration);

app.post('/api/generate-examples', async (req, res) => {
  const { word } = req.body;

  if (!word) {
    return res.status(400).json({ error: '単語またはフレーズが提供されていません。' });
  }

  try {
    const prompt = `Provide two example sentences using the word or phrase "${word}", and include a Japanese translation for each.`;
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt,
      max_tokens: 150,
      n: 1,
      stop: null,
      temperature: 0.7,
    });

    const examples = response.data.choices[0].text.trim();
    res.json({ examples });
  } catch (err) {
    console.error('OpenAI APIエラー:', err.response ? err.response.data : err.message);
    res.status(500).json({ error: '例文の生成に失敗しました。後ほど再試行してください。' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`サーバーがポート${PORT}で起動しました。`);
});
