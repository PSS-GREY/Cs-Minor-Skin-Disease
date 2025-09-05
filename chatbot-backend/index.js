// File: chatbot-backend/index.js

require('dotenv').config(); // Loads the .env file contents
const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

app.use(cors());
app.use(express.json());

// --- The Chatbot's Knowledge Base ---
// We use keywords to find the right answer.

const knowledgeBase = {
  // --- Category: Basic Skincare ---
  'skin type':
    "You can identify your skin type by observing how it feels after washing. Dry skin feels tight, oily skin looks shiny, combination skin is oily in the T-zone, and sensitive skin often gets red or itchy.",
  'routine':
    "A good, simple routine is: 1. Cleanser, 2. Moisturizer, and 3. Sunscreen (in the morning). You can add treatments or serums after cleansing and before moisturizing.",
  'wash face':
    "It's generally recommended to wash your face twice a day – once in the morning and once at night to remove dirt, oil, and makeup.",
  'moisturizer':
    "Yes, moisturizing is crucial for all skin types, including oily! It helps maintain your skin's barrier. If you have oily skin, look for a lightweight, 'non-comedogenic' (won't clog pores) moisturizer.",
  'water':
    "Staying hydrated is great for your overall health, which supports skin health. However, it won't magically cure dry skin on its own; you still need to use a good moisturizer.",
  'non-comedogenic':
    "'Non-comedogenic' means a product is formulated in a way that it is not likely to cause pore blockages (comedones) and breakouts.",

  // --- Category: Sun Protection ---
  'sunscreen':
    "Sunscreen is vital for protecting your skin from UV damage, which causes premature aging and increases the risk of skin cancer. It's the most important anti-aging product!",
  'spf':
    "SPF stands for Sun Protection Factor. It measures how much UV radiation is required to produce a sunburn on protected skin, relative to the amount required to burn unprotected skin.",
  'uva uvb':
    "UVA rays are associated with skin aging (wrinkles, spots), while UVB rays are associated with skin burning. Look for 'broad-spectrum' sunscreen which protects against both.",
  'cloudy':
    "Yes! Up to 80% of the sun's UV rays can pass through clouds, so you should wear sunscreen even on cloudy days to stay protected.",

  // --- Category: Common Conditions (General Info Only) ---
  'acne':
    "Acne is a condition where hair follicles become clogged with oil and dead skin cells. This can cause whiteheads, blackheads, or pimples. For persistent acne, it's best to see a doctor. This is not a diagnosis.",
  'eczema':
    "Eczema (atopic dermatitis) often appears as dry, itchy, and inflamed skin. Common triggers include certain soaps, fabrics, and allergens. A doctor can provide a proper diagnosis and treatment plan.",
  'psoriasis':
    "Psoriasis is a condition that causes skin cells to build up rapidly, resulting in scaling patches. It's an immune system issue. Please consult a professional for any medical advice.",
  'rosacea':
    "Rosacea is a common skin condition that causes blushing or flushing and visible blood vessels in your face. It may also produce small, pus-filled bumps. A diagnosis should be made by a healthcare provider.",

  // --- Category: When to See a Doctor ---
  'infection':
    "Signs of a skin infection can include increased redness, swelling, warmth, pain, or pus. If you notice any of these, it's important to seek medical attention promptly.",
  'worry about a rash':
    "You should see a doctor for a rash if it's painful, spreads rapidly, is all over your body, is accompanied by a fever, or doesn't improve with basic care.",
  'worry about a mole':
    "Consult a doctor if you notice any changes in a mole. Remember the ABCDEs: Asymmetry (one half doesn't match the other), Border (irregular), Color (uneven), Diameter (larger than 6mm), and Evolving (changing in size, shape, or color).",
    
  // --- Default Fallback Answer ---
  'default':
    "I'm sorry, I don't have information on that right now. I can answer questions about basic skincare, sun protection, and general info on common conditions like acne or eczema."
};

// This endpoint now has a fallback to Gemini
app.post('/chat', async (req, res) => {
  const { message } = req.body;
  const lowerCaseMessage = message.toLowerCase();
  let responseText = '';

  // First, check our own knowledge base
  let foundInKb = false;
  for (const keyword in knowledgeBase) {
    if (lowerCaseMessage.includes(keyword)) {
      responseText = knowledgeBase[keyword];
      foundInKb = true;
      break;
    }
  }

  // If not found in our knowledge base, call the Gemini API
  if (!foundInKb) {
    try {
      // This is the prompt that instructs Gemini how to behave
      const prompt = `You are a helpful and friendly chatbot for a skin health information website. Answer the user's question clearly and concisely. Do not provide medical diagnoses or advice. The user's question is: "${message}"`;
      
      const geminiRequest = {
        contents: [{ parts: [{ text: prompt }] }],
      };

      const geminiResponse = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(geminiRequest),
      });

      const geminiData = await geminiResponse.json();
      
      // Extract the text from the Gemini response
      responseText = geminiData.candidates[0].content.parts[0].text;

    } catch (error) {
      console.error("Error calling Gemini API:", error);
      responseText = "I'm having a little trouble connecting to my external knowledge base. Please try asking again in a moment.";
    }
  }

  res.json({ response: responseText });
});

app.listen(port, () => {
  console.log(`Chatbot backend listening at http://localhost:${port}`);
});
