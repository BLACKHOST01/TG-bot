const { run } = require('micro');
const bot = require('../utils/botCore');
const BOT_TOKEN = process.env.BOT_TOKEN;

module.exports = async (req, res) => {
  try {
    if (req.method === 'POST') {
      const update = await json(req);
      await bot.handleUpdate(update);
      return 'OK';
    }
    
    // Set webhook on first access (do this only once!)
    if (!process.env.WEBHOOK_SET) {
      const webhookUrl = `https://${req.headers.host}/api/bot`;
      await bot.setWebHook(webhookUrl);
      console.log(`Webhook set to: ${webhookUrl}`);
      process.env.WEBHOOK_SET = 'true';
    }
    
    return 'Telegram Bot is running!';
  } catch (error) {
    console.error('Error:', error);
    return 'Error occurred';
  }
};

// Helper to parse JSON
const json = req => new Promise(resolve => {
  let data = '';
  req.on('data', chunk => data += chunk);
  req.on('end', () => resolve(JSON.parse(data)));
});