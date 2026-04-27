// backend/routes/chatRoutes.js
const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are FitAI Coach, an expert AI personal fitness trainer 
and nutritionist built into the FitAI Trainer app.

You have deep expertise in:
- Exercise science, biomechanics, and proper form for all exercises
- Strength training, hypertrophy, endurance, and functional fitness
- Nutrition, macronutrients, meal planning, and caloric needs
- Recovery, sleep optimization, and injury prevention
- Workout programming for beginners, intermediate, and advanced athletes
- Real-time form correction and technique improvement

Your personality:
- Encouraging, motivating, and supportive like a real personal trainer
- Direct and specific — never give vague or generic answers
- Use fitness terminology but explain it clearly
- Give actionable advice the user can apply immediately
- When given workout context (exercise name, reps, form score), 
  use that data to give highly personalized advice

Important rules:
- Always give detailed, helpful responses — never one-liners
- If the user shares their current exercise stats, reference them specifically
- If form score is below 70%, prioritize form correction advice
- If reps are high, acknowledge their effort and suggest progression
- Never say you cannot help with fitness — always provide value
- Respond in a conversational, coach-like tone`;

router.post("/", async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "No message provided" });
    }

    // Use Gemini 2.5 Flash — fastest model with thinking capability
    const model = genAI.getGenerativeModel({
      model: "models/gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        temperature: 1,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 1024, // keep responses concise for voice
      },
    });

    // Build conversation history in Gemini format
    // Gemini uses "model" instead of "assistant" for AI role
    const formattedHistory = history
      .filter((msg) => msg.text && msg.text.trim())
      .map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.text }],
      }));

    // Start chat with history for multi-turn memory
    const chat = model.startChat({
      history: formattedHistory,
    });

    // Send the new message and get response
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      return res.status(500).json({ message: "Empty response from Gemini" });
    }

    res.json({ reply: text });
  } catch (err) {
    console.error("Gemini API error:", err.message || err);

    // Send specific error messages for easier debugging
    if (err.message?.includes("API_KEY")) {
      return res.status(401).json({ message: "Invalid Gemini API key. Check your .env file." });
    }
    if (err.message?.includes("quota")) {
      return res.status(429).json({ message: "Gemini quota exceeded. Try again later." });
    }

    res.status(500).json({
      message: "AI service error",
      error: err.message || "Unknown error",
    });
  }
});

module.exports = router;