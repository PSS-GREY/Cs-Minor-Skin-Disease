 // api.js
export async function askGemini(query) {
  const API_KEY = "AIzaSyALYFkkMqnY0whnqAbNeyfDe0H0Q6dt8ZI"; // replace with real Gemini API key
  const MODEL = "models/gemini-1.5-flash-latest"; // try flash first (cheaper & faster)

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: query }] }],
      }),
    }
  );

  const data = await res.json();
  console.log("Gemini raw response:", data);

  // Extract response safely
  if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
    return data.candidates[0].content.parts[0].text;
  }

  if (data?.promptFeedback?.blockReason) {
    return `⚠️ Blocked: ${data.promptFeedback.blockReason}`;
  }

  return "⚠️ No response from Gemini.";
}


