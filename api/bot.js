const { run } = require('micro');
const bot = require('../utils/botCore');

// Parse JSON request body
const parseJson = req => new Promise(resolve => {
  let data = '';
  req.on('data', chunk => data += chunk);
  req.on('end', () => {
    try {
      resolve(JSON.parse(data));
    } catch {
      resolve({});
    }
  });
});

// Webhook handler
module.exports = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const update = await parseJson(req);
      await bot.processUpdate(update);
      return 'OK';
    } catch (error) {
      console.error('Error processing update:', error);
      return { status: 500, body: 'Internal Server Error' };
    }
  }
  
  // Set webhook on first access
  if (!process.env.WEBHOOK_SET) {
    try {
      const webhookUrl = `https://${req.headers.host}/api/bot`;
      await bot.setWebHook(webhookUrl);
      console.log(`Webhook set to: ${webhookUrl}`);
      process.env.WEBHOOK_SET = 'true';
    } catch (error) {
      console.error('Error setting webhook:', error);
    }
  }
  
  return 'Telegram Bot is running!';
};