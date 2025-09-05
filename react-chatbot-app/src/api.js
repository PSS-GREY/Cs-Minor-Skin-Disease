// src/api.js

// Function to call our backend API instead of exposing Gemini API key
export async function askGemini(query) {
  try {
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    if (!res.ok) {
      throw new Error("Failed to fetch response from backend");
    }

    const data = await res.json();
    return data.reply || "⚠️ No response from Gemini.";
  } catch (err) {
    console.error("API error:", err);
    return "⚠️ Error fetching response from server.";
  }
}
