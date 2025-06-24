const TelegramBot = require('node-telegram-bot-api');
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token);

// Initialize KV storage (Vercel's key-value store)
const { kv } = require('@vercel/kv');

// Service data
const services = {
  "Premium Account": {
    price: "500 USDT",
    paymentAddress: "TJtQfUfg7WoJELx6aBuE1vDmsMncU8HNBF"
  },
  "VIP Access": {
    price: "100 USDT",
    paymentAddress: "TJtQfUfg7WoJELx6aBuE1vDmsMncU8HNBF"
  },
  "Basic Service": {
    price: "50 USDT",
    paymentAddress: "paypal.me/yourservice"
  }
};

// Helper to manage user sessions
async function getUserSession(chatId) {
  return await kv.get(`session_${chatId}`) || {};
}

async function updateUserSession(chatId, session) {
  await kv.set(`session_${chatId}`, session, { ex: 1800 }); // 30 min expiry
}

// /start command
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  await updateUserSession(chatId, {});
  
  bot.sendMessage(
    chatId,
    `🔒 Welcome ${msg.from.first_name}! How can I help?`,
    {
      reply_markup: {
        keyboard: [["📋 View Services"], ["❓ Help"]],
        resize_keyboard: true
      }
    }
  );
});

// Services command
bot.onText(/(\/services|📋 View Services)/, async (msg) => {
  const chatId = msg.chat.id;
  const serviceButtons = Object.keys(services).map(service => 
    [{ text: service, callback_data: `service_${service}` }]
  );
  
  bot.sendMessage(chatId, "🔍 Select a service:", {
    reply_markup: {
      inline_keyboard: [
        ...serviceButtons,
        [{ text: "ℹ️ Payment Help", callback_data: "payment_help" }]
      ]
    }
  });
});

// Handle callbacks
bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  const session = await getUserSession(chatId);

  if (data.startsWith("service_")) {
    const serviceName = data.split("_")[1];
    const service = services[serviceName];
    
    session.selectedService = serviceName;
    await updateUserSession(chatId, session);
    
    const message = 
      `💼 *${serviceName}*\n\n` +
      `💵 Price: ${service.price}\n` +
      `📍 Address: \`${service.paymentAddress}\``;
    
    await bot.editMessageText(message, {
      chat_id: chatId,
      message_id: query.message.message_id,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "💳 Pay Now", callback_data: "payment" }],
          [{ text: "🔙 Back", callback_data: "back" }]
        ]
      }
    });
  }
  else if (data === "payment") {
    const service = services[session.selectedService];
    
    bot.sendMessage(
      chatId,
      `💳 Send ${service.price} to:\n\`${service.paymentAddress}\`\n\n` +
      "Reply with TX hash after payment:",
      {
        parse_mode: "Markdown",
        reply_markup: { force_reply: true }
      }
    );
    
    session.paymentPending = true;
    await updateUserSession(chatId, session);
  }
  else if (data === "back") {
    const serviceButtons = Object.keys(services).map(service => 
      [{ text: service, callback_data: `service_${service}` }]
    );
    
    await bot.editMessageText("Select a service:", {
      chat_id: chatId,
      message_id: query.message.message_id,
      reply_markup: {
        inline_keyboard: [
          ...serviceButtons,
          [{ text: "ℹ️ Payment Help", callback_data: "payment_help" }]
        ]
      }
    });
  }
  else if (data === "payment_help") {
    bot.answerCallbackQuery(query.id, {
      text: "Send exact amount to provided address. Reply with TX hash after payment.",
      show_alert: true
    });
  }
});

// Handle messages
bot.on("message", async (msg) => {
  if (!msg.text || !msg.reply_to_message) return;
  
  const chatId = msg.chat.id;
  const session = await getUserSession(chatId);
  
  if (session.paymentPending) {
    const txHash = msg.text.trim();
    if (txHash.length < 20) {
      bot.sendMessage(chatId, "⚠️ Invalid TX hash. Please resend:");
      return;
    }
    
    const service = services[session.selectedService];
    bot.sendMessage(
      chatId,
      `✅ Payment received for ${session.selectedService}!\n\n` +
      `TX: ${txHash}\n\n` +
      `Processing your order...`
    );
    
    session.paymentPending = false;
    await updateUserSession(chatId, session);
  }
});

// Help command
bot.onText(/(\/help|❓ Help)/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "🛠 *Bot Commands*\n\n" +
    "/start - Launch bot\n" +
    "/services - View services\n" +
    "/help - Show help\n\n" +
    "Send exact amount to provided address",
    { parse_mode: "Markdown" }
  );
});

// Webhook handler
module.exports = async (req, res) => {
  try {
    if (req.method === "POST") {
      // Parse update
      const update = JSON.parse(req.body);
      
      // Handle update
      await bot.handleUpdate(update);
      
      // Set webhook on first run
      if (!process.env.WEBHOOK_SET) {
        const webhookUrl = `https://${req.headers.host}/api/bot`;
        await bot.setWebHook(webhookUrl);
        process.env.WEBHOOK_SET = "true";
      }
      
      return res.status(200).send("OK");
    }
    return res.status(200).send("Use POST method for Telegram updates");
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send("Internal Server Error");
  }
};