// File: src/chatbot/ActionProvider.js

class ActionProvider {
  constructor(createChatBotMessage, setStateFunc) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
  }

  // This function is called from the MessageParser
  handleUserMessage = (message) => {
    // Send the user's message to the backend API
    fetch('http://localhost:5000/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    })
      .then((res) => res.json())
      .then((data) => {
        const botMessage = this.createChatBotMessage(data.response);
        this.addMessageToState(botMessage);
      })
      .catch((err) => {
        console.log(err);
        const errorMessage = this.createChatBotMessage("Sorry, I'm having trouble connecting. Please try again later.");
        this.addMessageToState(errorMessage);
      });
  };

  // Helper function to add the bot's message to the chat state
  addMessageToState = (botMessage) => {
    this.setState((prevState) => ({
      ...prevState,
      messages: [...prevState.messages, botMessage],
    }));
  };
}

export default ActionProvider;