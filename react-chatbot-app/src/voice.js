// voice.js
export default class VoiceRecognition {
  constructor(onResult, onEnd) {
    // Use browser's Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false; // stop after a sentence
    this.recognition.interimResults = false; // no half results
    this.recognition.lang = "en-US"; // set language

    // when voice result detected
    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (onResult) onResult(transcript);
    };

    // when recording ends
    this.recognition.onend = () => {
      if (onEnd) onEnd();
    };
  }

  start() {
    try {
      this.recognition.start();
    } catch (e) {
      console.error("Voice recognition error:", e);
    }
  }

  stop() {
    try {
      this.recognition.stop();
    } catch (e) {
      console.error("Voice recognition stop error:", e);
    }
  }
}
