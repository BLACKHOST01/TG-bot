const TelegramBot = require('node-telegram-bot-api');
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token);

// Service data with payment details and ID requirements
const services = {
  "Premium Account": {
    description: "Exclusive premium account features",
    price: "500 USDT",
    paymentAddress: "TJtQfUfg7WoJELx6aBuE1vDmsMncU8HNBF",
    currency: "USDT",
    requiresUserId: true,
  },
  "VIP Access": {
    description: "VIP community and support access",
    price: "100 USDT",
    paymentAddress: "TJtQfUfg7WoJELx6aBuE1vDmsMncU8HNBF",
    currency: "USDT",
    requiresUserId: true,
  },
  "Basic Service": {
    description: "Standard service package",
    price: "50 USDT",
    paymentAddress: "paypal.me/yourservice",
    currency: "USDT",
    requiresUserId: false,
  },
};

// User session management (in-memory - for production use Redis/Vercel KV)
const userSessions = {};

// Helper function to validate user IDs
function isValidUserId(userId) {
  return /^\d{5,12}$/.test(userId);
}

// /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  userSessions[chatId] = {};

  bot.sendMessage(
    chatId,
    `🔒 Welcome ${msg.from.first_name}! We offer a variety of services including unban and unlock features.`,
    {
      reply_markup: {
        keyboard: [["📋 View Services"], ["❓ Help"], ["/start"]],
        resize_keyboard: true,
      },
    }
  );
});

// Services command
bot.onText(/(\/services|📋 View Services|services)/i, (msg) => {
  const chatId = msg.chat.id;

  const serviceButtons = Object.keys(services).map((service) => [
    { text: service, callback_data: `service_${service}` },
  ]);

  bot.sendMessage(chatId, "🔍 Select a service for details:", {
    reply_markup: {
      inline_keyboard: [
        ...serviceButtons,
        [{ text: "ℹ️ Payment Instructions", callback_data: "payment_help" }],
      ],
    },
  });
});

// Handle service selection
bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  if (data.startsWith("service_")) {
    const serviceName = data.split("_")[1];
    const service = services[serviceName];

    userSessions[chatId] = {
      ...(userSessions[chatId] || {}),
      selectedService: serviceName,
    };

    const serviceMessage =
      `💼 *${serviceName}*\n${service.description}\n\n` +
      `💵 Price: ${service.price}\n` +
      `💰 Currency: ${service.currency}`;

    const buttons = [
      [
        {
          text: "🆔 Verify User ID",
          callback_data: "verify_user_id",
        },
      ],
      [
        {
          text: "💳 Proceed to Payment",
          callback_data: "proceed_payment",
          hide: service.requiresUserId,
        },
      ],
      [
        {
          text: "🔙 Back to Services",
          callback_data: "back_to_services",
        },
      ],
    ].filter(btn => !btn[0].hide);

    await bot.editMessageText(serviceMessage, {
      chat_id: chatId,
      message_id: query.message.message_id,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: buttons,
      },
    });
  }
  else if (data === "proceed_payment") {
    const serviceName = userSessions[chatId]?.selectedService;

    if (serviceName) {
      const service = services[serviceName];
      const verifiedId = userSessions[chatId]?.verifiedUserId;

      if (service.requiresUserId && !verifiedId) {
        bot.answerCallbackQuery(query.id, {
          text: "❌ User ID verification required first!",
          show_alert: true,
        });
        return;
      }

      const paymentMessage =
        `💳 *Payment Instructions*\n\n` +
        `Send ${service.price} ${service.currency} to:\n` +
        `\`${service.paymentAddress}\`\n\n` +
        (verifiedId ? `✅ Verified for User ID: ${verifiedId}\n\n` : "") +
        `Reply with your transaction hash after payment`;

      bot.sendMessage(chatId, paymentMessage, {
        parse_mode: "Markdown",
        reply_markup: {
          force_reply: true,
          input_field_placeholder: "Paste transaction hash here",
        },
      });

      userSessions[chatId].paymentPending = true;
    }
    bot.answerCallbackQuery(query.id);
  }
  else if (data === "back_to_services") {
    const serviceButtons = Object.keys(services).map((service) => [
      { text: service, callback_data: `service_${service}` },
    ]);

    await bot.editMessageText("Select a service for details:", {
      chat_id: chatId,
      message_id: query.message.message_id,
      reply_markup: {
        inline_keyboard: [
          ...serviceButtons,
          [{ text: "ℹ️ Payment Instructions", callback_data: "payment_help" }],
        ],
      },
    });
  }
  else if (data === "verify_user_id") {
    userSessions[chatId].awaitingUserId = true;

    await bot.sendMessage(
      chatId,
      "🔐 Please enter the User ID you want to verify (5-12 digits):",
      {
        reply_markup: {
          force_reply: true,
        },
      }
    );

    bot.answerCallbackQuery(query.id);
  }
  else if (data === "payment_help") {
    const helpText =
      "📝 *Payment Instructions*\n\n" +
      "1. Select a service\n" +
      "2. Verify User ID if required\n" +
      "3. Copy the payment address\n" +
      "4. Send the exact amount\n" +
      "5. Reply with your transaction hash\n" +
      "6. We'll confirm within 10 mins";

    bot.answerCallbackQuery(query.id, {
      text: helpText,
      show_alert: true,
    });
  }
});

// Handle text messages
bot.on("message", (msg) => {
  if (!msg.text) return;
  
  const chatId = msg.chat.id;
  const session = userSessions[chatId];
  if (!session) return;

  // Handle user ID verification
  if (session.awaitingUserId) {
    const userIdInput = msg.text.trim();

    if (isValidUserId(userIdInput)) {
      session.verifiedUserId = userIdInput;
      session.awaitingUserId = false;

      bot.sendMessage(
        chatId,
        `✅ User ID ${userIdInput} verified successfully!`,
        { reply_markup: { remove_keyboard: true } }
      );

      // Prompt for payment after verification
      const serviceName = session.selectedService;
      if (serviceName) {
        bot.sendMessage(
          chatId,
          `You can now proceed with payment for "${serviceName}"`,
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: "💳 Proceed to Payment", callback_data: "proceed_payment" }],
              ],
            },
          }
        );
      }
    } else {
      bot.sendMessage(
        chatId,
        "❌ Invalid User ID format. Please enter 5-12 digits:",
        { reply_markup: { force_reply: true } }
      );
    }
    return;
  }

  // Handle payment confirmation
  if (session.paymentPending && msg.reply_to_message) {
    const serviceName = session.selectedService;
    const txHash = msg.text.trim();

    if (txHash.length > 20) {
      const verifiedId = session.verifiedUserId 
        ? `for User ID: ${session.verifiedUserId}` 
        : "";

      bot.sendMessage(
        chatId,
        `✅ Payment received for ${serviceName} ${verifiedId}!\n\n` +
        `Transaction: ${txHash}\n\n` +
        `We'll process your order shortly. Thank you!`
      );

      // Clear payment state
      delete session.paymentPending;
    } else {
      bot.sendMessage(
        chatId,
        "⚠️ Invalid transaction format. Please check and resend."
      );
    }
  }
});

// Help command
bot.onText(/(\/help|❓ Help)/, (msg) => {
  const helpText =
    "🛠 *Bot Help*\n\n" +
    "/start - Launch the bot\n" +
    "/services - View services\n" +
    "/help - Show this message\n\n" +
    "🔐 *ID Verification:* Required for some services\n" +
    "💳 *Payment:* Always send exact amount to specified address";

  bot.sendMessage(msg.chat.id, helpText, { parse_mode: "Markdown" });
});

// User ID verification status
bot.onText(/\/myid/, (msg) => {
  const chatId = msg.chat.id;
  const session = userSessions[chatId];

  if (session?.verifiedUserId) {
    bot.sendMessage(chatId, `✅ Your verified User ID: ${session.verifiedUserId}`);
  } else {
    bot.sendMessage(chatId, "❌ No verified User ID found");
  }
});

// Admin verification command
bot.onText(/\/verify (.+)/, (msg, match) => {
  const adminId = process.env.ADMIN_ID;
  if (msg.from.id.toString() !== adminId) return;

  const userId = match[1];
  const chatId = msg.chat.id;

  if (isValidUserId(userId)) {
    bot.sendMessage(chatId, `✅ Admin verified User ID: ${userId}`);
    
    // Notify users with this ID
    Object.entries(userSessions).forEach(([cid, session]) => {
      if (session.verifiedUserId === userId) {
        bot.sendMessage(cid, `🌟 Your User ID ${userId} has been verified by admin!`);
      }
    });
  } else {
    bot.sendMessage(chatId, `❌ Invalid User ID format: ${userId}`);
  }
});

module.exports = bot;