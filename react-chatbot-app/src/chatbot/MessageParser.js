// File: src/chatbot/MessageParser.js

class MessageParser {
  constructor(actionProvider) {
    this.actionProvider = actionProvider;
  }

  parse(message) {
    const lowerCaseMessage = message.toLowerCase();
    this.actionProvider.handleUserMessage(lowerCaseMessage);
  }
}

export default MessageParser;