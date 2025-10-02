// api.js
export async function askGemini(query) {
  const API_KEY = "AIzaSyCJWnTWiGD_QwZmVemQUwbbT0TBQ7PSrK4"; // 🔑 replace with your key
  const MODEL = "models/gemini-2.0-flash"; // ✅ correct model name

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${MODEL}:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: query }],
            },
          ],
        }),
      }
    );

    const data = await res.json();
    console.log("Gemini raw response:", data);

    // ✅ Extract text safely
    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    }

    if (data?.promptFeedback?.blockReason) {
      return `⚠️ Blocked: ${data.promptFeedback.blockReason}`;
    }

    return "⚠️ No response from Gemini.";
  } catch (err) {
    console.error("Gemini API Error:", err);
    return "⚠️ Error: Could not reach Gemini service.";
  }
}