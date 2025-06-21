// // // // const tgbot = require("node-telegram-bot-api");
// // // // const token = "7915955632:AAGzahIfI8H3RnkY1kCJdq2F1sAE4ku5cgU";
// // // // const bot = new tgbot(token, { polling: true });

// // // // bot.onText(/\/start/, (msg) => {
// // // //   bot.sendMessage(msg.chat.id, "hello ther im your bot ");
// // // // });

// // // // bot.on("message", (msg) => {
// // // //   if (msg.text.toLowerCase() === "hi") {
// // // //     bot.sendMessage(msg.cha.id, "hey there!!!!!!");
// // // //   }
// // // // });
// // // const tgbot = require("node-telegram-bot-api");
const token = "7915955632:AAGzahIfI8H3RnkYlKCJdq2FlsAE4ku5CgU"; // ⚠️ Remove this before sharing publicly!

// const tgbot = require("node-telegram-bot-api");
// // const token = "YOUR_TELEGRAM_BOT_TOKEN_HERE"; // Replace with your actual token
// const bot = new tgbot(token, { polling: true });

// console.log("Service Payment Bot is running...");

// // Service data with payment details
// const services = {
//   "Webw Design": {
//     description: "Professional website design and UI/UX",
//     price: "$500",
//     paymentAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
//     currency: "ETH"
//   },
//   "Wseb Design": {
//     description: "Professional website design and UI/UX",
//     price: "$500",
//     paymentAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
//     currency: "ETH"
//   },
//   "Web Desisdgn": {
//     description: "Professional website design and UI/UX",
//     price: "$500",
//     paymentAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
//     currency: "ETH"
//   },
//   "Web Desiwergn": {
//     description: "Professional website design and UI/UX",
//     price: "$500",
//     paymentAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
//     currency: "ETH"
//   },
//   "App Development": {
//     description: "Mobile application development",
//     price: "$1500",
//     paymentAddress: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
//     currency: "BTC"
//   },
//   "SEO Optimization": {
//     description: "Search engine optimization services",
//     price: "$300",
//     paymentAddress: "rPw4S4H3JcQE5xUZcX5f2j4Y6Z7vqkG5Jt",
//     currency: "XRP"
//   }
// };

// // User session state
// const userSessions = {};

// // /start command
// bot.onText(/\/start/, (msg) => {
//   const chatId = msg.chat.id;
//   const welcomeMsg = `👋 Hello ${msg.from.first_name}! I'm your Services Payment Bot.\n\n` +
//                     "Use /services to see my offerings and payment options";

//   bot.sendMessage(chatId, welcomeMsg, {
//     reply_markup: {
//       keyboard: [["📋 View Services"]],
//       resize_keyboard: true
//     }
//   });

// });

// // /services command
// bot.onText(/(\/services|📋 View Services|services)/i, (msg) => {
//   const chatId = msg.chat.id;

//   const serviceButtons = Object.keys(services).map(service =>
//     [{ text: service, callback_data: `service_${service}` }]
//   );

//   bot.sendMessage(chatId, "Select a service for payment details:", {
//     reply_markup: {
//       inline_keyboard: [
//         ...serviceButtons,
//         [{ text: "💳 Payment Instructions", callback_data: "payment_help" }]
//       ]
//     }
//   });
// });

// // Handle service selection
// bot.on("callback_query", async (query) => {
//   const chatId = query.message.chat.id;
//   const data = query.data;

//   if (data.startsWith("service_")) {
//     const serviceName = data.split("_")[1];
//     const service = services[serviceName];

//     // Save service selection in session
//     userSessions[chatId] = { selectedService: serviceName };

//     const paymentMessage = `💼 *${serviceName}*\n${service.description}\n\n` +
//                           `💵 Price: ${service.price}\n` +
//                           `📍 Payment Address: \`${service.paymentAddress}\`\n` +
//                           `💰 Currency: ${service.currency}`;

//     await bot.editMessageText(paymentMessage, {
//       chat_id: chatId,
//       message_id: query.message.message_id,
//       parse_mode: "Markdown",
//       reply_markup: {
//         inline_keyboard: [
//           [{
//             text: "📋 Copy Address",
//             callback_data: `copy_${service.paymentAddress}`
//           }],
//           [{
//             text: "✅ Confirm Payment",
//             callback_data: "confirm_payment"
//           }],
//           [{
//             text: "🔙 Back to Services",
//             callback_data: "back_to_services"
//           }]
//         ]
//       }
//     });
//   }
//   // Handle address copying
//   else if (data.startsWith("copy_")) {
//     const address = data.split("_")[1];
//     bot.answerCallbackQuery(query.id, {
//       text: "Address copied to clipboard!",
//       show_alert: true
//     });
//     // In a real implementation, you would use the Telegram clipboard API
//     // This is just a visual indicator
//   }
//   // Handle payment confirmation
//   else if (data === "confirm_payment") {
//     const serviceName = userSessions[chatId]?.selectedService;

//     if (serviceName) {
//       const service = services[serviceName];

//       bot.sendMessage(chatId, `Please send ${service.currency} to:\n\`${service.paymentAddress}\``, {
//         parse_mode: "Markdown",
//         reply_markup: {
//           force_reply: true,
//           input_field_placeholder: "Paste transaction hash here after payment"
//         }
//       });

//       // Set payment pending state
//       userSessions[chatId].paymentPending = true;
//     }

//     bot.answerCallbackQuery(query.id);
//   }
//   // Handle back to services
//   else if (data === "back_to_services") {
//     const serviceButtons = Object.keys(services).map(service =>
//       [{ text: service, callback_data: `service_${service}` }]
//     );

//     await bot.editMessageText("Select a service for payment details:", {
//       chat_id: chatId,
//       message_id: query.message.message_id,
//       reply_markup: {
//         inline_keyboard: [
//           ...serviceButtons,
//           [{ text: "💳 Payment Instructions", callback_data: "payment_help" }]
//         ]
//       }
//     });
//   }
//   // Payment instructions
//   else if (data === "payment_help") {
//     const helpText = "📝 *Payment Instructions*\n\n" +
//                      "1. Select a service\n" +
//                      "2. Copy the payment address\n" +
//                      "3. Send the exact amount in the specified currency\n" +
//                      "4. Reply to the payment message with your transaction hash\n" +
//                      "5. We'll confirm your payment within 24 hours";

//     bot.answerCallbackQuery(query.id, { text: "Payment instructions", show_alert: true });

//     // Send as new message to keep interface clean
//     bot.sendMessage(chatId, helpText, { parse_mode: "Markdown" });
//   }
// });

// // Handle payment confirmation messages
// bot.on("message", (msg) => {
//   const chatId = msg.chat.id;

//   // Check if user is replying to payment request
//   if (msg.reply_to_message && userSessions[chatId]?.paymentPending) {
//     const serviceName = userSessions[chatId].selectedService;
//     const service = services[serviceName];

//     const txHash = msg.text.trim();

//     // Validate transaction hash format (basic example)
//     if (txHash.length > 20) {
//       bot.sendMessage(chatId, `✅ Payment received for ${serviceName}!\n\n` +
//                              `Transaction: ${txHash}\n\n` +
//                              `We'll confirm your payment shortly. Thank you!`);

//       // Clear payment state
//       delete userSessions[chatId].paymentPending;

//       // Here you would typically:
//       // 1. Save to database
//       // 2. Send notification to admin
//       // 3. Process the order
//     } else {
//       bot.sendMessage(chatId, "⚠️ Invalid transaction format. Please check and resend.");
//     }
//   }
// });

// // Help command
// bot.onText(/\/help/, (msg) => {
//   const helpText = "🛠 *Bot Help*\n\n" +
//                    "/start - Launch the bot\n" +
//                    "/services - View services and payment options\n" +
//                    "/help - Show this help message\n\n" +
//                    "After payment, reply to the payment message with your transaction hash";

//   bot.sendMessage(msg.chat.id, helpText, { parse_mode: "Markdown" });
// });

const tgbot = require("node-telegram-bot-api");
// const token = "YOUR_TELEGRAM_BOT_TOKEN_HERE"; // Replace with your actual token
const bot = new tgbot(token, { polling: true });

console.log("Secure Service Payment Bot is running...");

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

// User session management
const userSessions = {};

// Helper function to validate user IDs
function isValidUserId(userId) {
  // Customize these validation rules as needed
  return /^\d{5,12}$/.test(userId); // 5-12 digit format
}

// /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  userSessions[chatId] = {}; // Initialize session

  bot.sendMessage(
    chatId,
    `🔒 Welcome ${msg.from.first_name}! offer a variety of services unban, unlock`,
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

    // Store service selection in session
    userSessions[chatId] = {
      ...(userSessions[chatId] || {}),
      selectedService: serviceName,
    };

    const serviceMessage =
      `💼 *${serviceName}*\n${service.description}\n\n` +
      `💵 Price: ${service.price}\n` +
      `💰 Currency: ${service.currency}`;

    // Buttons based on whether ID is required
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
          hide: service.requiresUserId, // Hide if ID required
        },
      ],
      [
        {
          text: "🔙 Back to Services",
          callback_data: "back_to_services",
        },
      ],
    ].filter((btn) => !btn[0].hide); // Remove hidden buttons

    await bot.editMessageText(serviceMessage, {
      chat_id: chatId,
      message_id: query.message.message_id,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: buttons,
      },
    });
  }
  // Handle address copying
  else if (data.startsWith("copy_")) {
    const address = data.split("_")[1];
    bot.answerCallbackQuery(query.id, {
      text: "Address copied to clipboard!",
      show_alert: true,
    });
  }
  // Handle payment confirmation
  else if (data === "proceed_payment") {
    const serviceName = userSessions[chatId]?.selectedService;

    if (serviceName) {
      const service = services[serviceName];
      const verifiedId = userSessions[chatId]?.verifiedUserId;

      // Check if ID is required but not verified
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

      // Set payment pending state
      userSessions[chatId].paymentPending = true;
    }

    bot.answerCallbackQuery(query.id);
  }
  // Handle back to services
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
  // User ID verification flow
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
  // Payment instructions
  else if (data === "payment_help") {
    const helpText =
      "📝 *Payment Instructions*\n\n" +
      "To make a payment, follow these steps:\n\n" +
      "All servies payments are made through USDT\n\n" +
      "1. Select a service\n" +
      "2. Verify User ID if required\n" +
      "3. Copy the payment address\n" +
      "4. Send the exact amount\n" +
      "5. Reply with your transaction hash\n" +
      "6. We'll confirm within 10 mins";

    bot.answerCallbackQuery(query.id, {
      text: "Payment instructions",
      show_alert: true,
    });
    bot.sendMessage(chatId, helpText, { parse_mode: "Markdown" });
  }
});

// Handle user ID verification input
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
        {
          reply_markup: {
            remove_keyboard: true,
          },
        }
      );

      // Show payment button for the selected service
      const serviceName = session.selectedService;
      if (serviceName) {
        const service = services[serviceName];

        bot.sendMessage(
          chatId,
          `You can now proceed with payment for "${serviceName}"`,
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "💳 Proceed to Payment",
                    callback_data: "proceed_payment",
                  },
                ],
              ],
            },
          }
        );
      }
    } else {
      bot.sendMessage(
        chatId,
        "❌ Invalid User ID format. Please enter 5-12 digits:",
        {
          reply_markup: {
            force_reply: true,
          },
        }
      );
    }
    return;
  }

  // Handle payment confirmation
  if (session.paymentPending && msg.reply_to_message) {
    const serviceName = session.selectedService;
    const service = services[serviceName];

    const txHash = msg.text.trim();

    // Validate transaction hash format
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
    "🔐 *ID Verification:*\n" +
    "Some services require User ID verification before payment\n\n" +
    "💳 *Payment Process:*\n" +
    "1. Select service\n" +
    "2. Verify ID if needed\n" +
    "3. Copy payment address\n" +
    "4. Send exact amount\n" +
    "5. Reply with transaction hash";

  bot.sendMessage(msg.chat.id, helpText, { parse_mode: "Markdown" });
});

// User ID verification status command
bot.onText(/\/myid/, (msg) => {
  const chatId = msg.chat.id;
  const session = userSessions[chatId];

  if (session?.verifiedUserId) {
    bot.sendMessage(
      chatId,
      `✅ Your verified User ID: ${session.verifiedUserId}`
    );
  } else {
    bot.sendMessage(
      chatId,
      "❌ No verified User ID found. Please verify through service selection."
    );
  }
});

// Admin command to verify IDs manually
bot.onText(/\/verify (.+)/, (msg, match) => {
  const adminId = "YOUR_ADMIN_USER_ID"; // Replace with your actual admin ID
  if (msg.from.id.toString() !== adminId) return;

  const userId = match[1];
  const chatId = msg.chat.id;

  if (isValidUserId(userId)) {
    bot.sendMessage(chatId, `✅ Admin verified User ID: ${userId}`);

    // Notify users with this ID in session
    Object.entries(userSessions).forEach(([cid, session]) => {
      if (session.verifiedUserId === userId) {
        bot.sendMessage(
          cid,
          `🌟 Your User ID ${userId} has been verified by admin!`
        );
      }
    });
  } else {
    bot.sendMessage(chatId, `❌ Invalid User ID format: ${userId}`);
  }
});
