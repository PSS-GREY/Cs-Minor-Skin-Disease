import React, { useState, useEffect, useRef } from "react";
import { searchKnowledgeBase } from "./kb";
import { askGemini } from "./api";
import VoiceRecognition from "./voice";

function App() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "👋 Hi! I'm SkinCare AI. Ask me about skin diseases." },
    { sender: "bot", text: "⚠️ Reminder: I am not a doctor. Always consult a professional for medical advice." },
  ]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const voiceRef = useRef(null);

  // Initialize voice recognition
  useEffect(() => {
    if (!voiceRef.current) {
      voiceRef.current = new VoiceRecognition(
        (text) => {
          setInput(text);
          setListening(false);
        },
        () => setListening(false)
      );
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    const kbAnswer = searchKnowledgeBase(input);
    if (kbAnswer) {
      setMessages((prev) => [...prev, { sender: "bot", text: kbAnswer }]);
      setInput("");
      return;
    }

    const aiResponse = await askGemini(input);
    setMessages((prev) => [...prev, { sender: "bot", text: aiResponse }]);
    setInput("");
  };

  const handleVoiceToggle = () => {
    if (!voiceRef.current) return;
    if (listening) {
      voiceRef.current.stop();
      setListening(false);
    } else {
      voiceRef.current.start();
      setListening(true);
    }
  };

  // Upload / Camera submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a file first!");
      return;
    }

    let formData = new FormData();
    formData.append("file", file);

    try {
      let res = await fetch("https://skin-disease-model-backend.onrender.com/predict", {
        method: "POST",
        body: formData,
      });

      let data = await res.json();
      setResult(data);

      setMessages((prev) => [
  ...prev,
  { sender: "user", text: "📷 Uploaded an image for analysis" },
  {
    sender: "bot",
    text: `🧾 Prediction: ${data.res || "Unknown"}`
  }
]);


    } catch (err) {
      console.error("Error", err);
      setMessages((prev) => [...prev, { sender: "bot", text: "❌ Error analyzing the image." }]);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 via-teal-400 to-green-400">
      <div className="w-full max-w-3xl bg-white/90 shadow-2xl rounded-2xl p-6 backdrop-blur-sm">
        <h1 className="text-2xl font-bold text-blue-700 mb-2 flex items-center gap-2">
          🧴 Skin Disease Detection Helper
        </h1>
        <p className="text-gray-600 mb-4">
          ⚠️ This chatbot provides general information only. Please consult a qualified dermatologist for diagnosis or treatment.
        </p>

        {/* Chat Window */}
        <div className="h-96 overflow-y-auto border rounded-xl p-4 bg-gray-50/80 custom-scrollbar">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`mb-3 ${msg.sender === "user" ? "text-right" : "text-left"}`}
            >
              <span
                className={`inline-block px-4 py-2 rounded-2xl whitespace-pre-line ${
                  msg.sender === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {msg.text}
              </span>
            </div>
          ))}
        </div>

        {/* Text + Voice + Camera + Send */}
        <div className="flex mt-4 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about skin diseases..."
            className="flex-1 border px-4 py-2 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {/* Voice button */}
          <button
            onClick={handleVoiceToggle}
            className={`px-4 py-2 ${listening ? "bg-red-500" : "bg-green-500"} text-white`}
          >
            {listening ? "Stop 🎤" : "🎤"}
          </button>

          {/* Camera button */}
          <div className="relative">
            <button
              onClick={() => setShowImageOptions(!showImageOptions)}
              className="bg-purple-600 text-white px-4 py-2 hover:bg-purple-700"
            >
              📷
            </button>
            {showImageOptions && (
              <div className="absolute bottom-12 right-0 bg-white shadow-lg rounded-lg w-36 z-10">
                <label className="block px-4 py-2 cursor-pointer hover:bg-gray-200">
                  📁 Upload
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      setFile(e.target.files[0]);
                      setShowImageOptions(false);
                    }}
                    className="hidden"
                  />
                </label>
                <label className="block px-4 py-2 cursor-pointer hover:bg-gray-200">
                  📸 Take Photo
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => {
                      setFile(e.target.files[0]);
                      setShowImageOptions(false);
                    }}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Send button */}
          <button
            onClick={handleSend}
            className="bg-blue-600 text-white px-6 py-2 rounded-r-xl hover:bg-blue-700"
          >
            Send
          </button>
        </div>

        {/* Hidden form auto-submits when file is chosen */}
        {file && (
          <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-700">Selected: {file.name}</span>
            <button
              type="submit"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              Analyze
            </button>
          </form>
        )}

       {result && (
  <div className="mt-4 p-3 bg-gray-100 rounded-lg">
    <h2 className="font-bold">Result:</h2>
    <p>Prediction: {result.res}</p>
   
  </div>
)}

      </div>
    </div>
  );
}

export default App;



