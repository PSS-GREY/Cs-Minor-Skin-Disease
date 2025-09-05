// File: src/chatbot/config.js

import { createChatBotMessage } from 'react-chatbot-kit';

const botName = 'sk-infobot';

const config = {
  botName: botName,
  initialMessages: [
    createChatBotMessage(`Hi! I'm ${botName}. I can provide general info about common skin conditions. How can I help?`),
    createChatBotMessage("Remember, I am not a doctor. For any medical advice, please consult a professional.", {
      delay: 500,
    }),
  ],
};

export default config;