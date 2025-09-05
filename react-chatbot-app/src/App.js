import React, { useState, useEffect, useRef } from "react";
import { askGemini } from "./api";
import VoiceRecognition from "./voice";   // ✅ voice.js
import "./App.css";
import ReactMarkdown from "react-markdown";

export default function App() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! I'm sk-infobot. I can provide general info about common skin conditions. How can I help?",
    },
    {
      role: "assistant",
      text: "Remember, I am not a doctor. For any medical advice, please consult a professional.",
    },
  ]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [showExtras, setShowExtras] = useState(false);
  const [listening, setListening] = useState(false); // ✅ mic state

  const chatEndRef = useRef(null);
  const voiceRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Init voice only once
  useEffect(() => {
    if (!voiceRef.current) {
      voiceRef.current = new VoiceRecognition(
        (text) => {
          setQuery(text); 
          setListening(false);
        },
        () => setListening(false)
      );
    }
  }, []);

  const handleAsk = async () => {
    if (!query.trim()) return;

    const newMessages = [...messages, { role: "user", text: query }];
    setMessages(newMessages);
    setQuery("");
    setLoading(true);

    try {
      const response = await askGemini(query);
      setMessages([...newMessages, { role: "assistant", text: response }]);
    } catch (err) {
      console.error(err);
      setMessages([
        ...newMessages,
        { role: "assistant", text: "⚠️ Error fetching response." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceClick = () => {
    const voice = voiceRef.current;
    if (!voice) return;

    if (listening) {
      voice.stop();
      setListening(false);
    } else {
      voice.start();
      setListening(true);
    }
  };

  return (
    <div className="page-container">
      {/* Main Title */}
      <h1 className="chat-title">Skin Disease Detection Helper</h1>

      {/* Chatbox */}
      <div className="chat-wrapper">
        <div className="chat-header">Conversation with sk-infobot</div>

        {/* Chat body */}
        <div className="chat-body">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-message ${msg.role}`}>
              {msg.role === "assistant" && <div className="bot-icon">B</div>}
              <div className="bubble">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
              {msg.role === "user" && <div className="user-icon">👤</div>}
            </div>
          ))}
          {loading && (
            <div className="chat-message assistant">
              <div className="bot-icon">B</div>
              <div className="bubble">Typing...</div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input bar */}
        <div className="chat-input">
          {/* Plus toggle */}
          <button className="plus-btn" onClick={() => setShowExtras(!showExtras)}>
            {showExtras ? "×" : "+"}
          </button>

          <input
            type="text"
            placeholder="Ask skin disease related queries here ...."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAsk()}
          />

          {/* Extra buttons */}
          {showExtras && (
            <>
              {/* 🎤 Voice button */}
              <button className="icon-btn" onClick={handleVoiceClick}>
                {listening ? "🛑 Stop" : "🎤"}
              </button>

              {/* 📷 Image button (future step) */}
              <button className="icon-btn">📷</button>
            </>
          )}

          <button onClick={handleAsk} disabled={loading}>
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
