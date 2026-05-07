const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const WorkoutSession = require("../models/WorkoutSession");
const MealLog = require("../models/MealLog");
const BodyMetrics = require("../models/BodyMetrics");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Generate a dynamic, personalized weekly workout plan via Gemini
router.get("/weekly-plan", protect, async (req, res) => {
  try {
    const metrics = await BodyMetrics.findOne({ user: req.user._id });
    
    const goal = metrics?.goal || "maintain";
    const age = metrics?.age || 25;
    const weight = metrics?.weightKg || 70;
    const height = metrics?.heightCm || 170;
    const activityLevel = metrics?.activityLevel || "moderate";

    const prompt = `You are FitAI Personal Trainer, an expert athletic programmer.
Generate a highly personalized 7-day workout plan tailored specifically to the user's goals and metrics:
- Goal: ${goal}
- Age: ${age} years old
- Weight: ${weight} kg
- Height: ${height} cm
- Activity Level: ${activityLevel}

The response MUST be a valid JSON array containing exactly 7 objects (one for each day from Sunday to Saturday).
Each object representing a day MUST have:
1. "day": string (must be exactly "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", or "Saturday")
2. "exercises": an array of objects representing specific exercises. Each day MUST have a minimum of 4 exercises/lifts (exactly 4 or 5 exercises). Choose exercises from this list of supported exercise IDs:
   - Chest: "push-ups", "wide-push-ups", "diamond-push-ups", "pike-push-ups", "decline-push-ups"
   - Legs: "squats", "sumo-squats", "lunges", "jump-squats", "glute-bridge", "calf-raises"
   - Back: "superman", "good-mornings", "bent-over-row", "back-extension", "bird-dog"
   - Arms: "bicep-curls", "hammer-curls", "tricep-dips"
   - Shoulders: "shoulder-press", "lateral-raise", "front-raise", "arnold-press", "upright-row"

Each exercise object in the array MUST have:
- "exId": string (must exactly match one of the IDs listed above)
- "sets": number (e.g., 3 or 4)
- "reps": number (e.g., 10, 12, or 15)
- "notes": string (short motivational or form coaching tip, e.g., "Keep core tight and shoulders down")

Return ONLY the raw JSON array. Do not wrap it in markdown code blocks like \`\`\`json, do not write any surrounding conversational text, just return the raw valid JSON.`;

    const model = genAI.getGenerativeModel({
      model: "models/gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    if (!text) {
      return res.status(500).json({ message: "Empty response from Gemini AI" });
    }

    // Completely bulletproof JSON extraction using regex matching any array outer brackets [ ... ]
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Invalid JSON array format returned by AI: " + text);
    }

    const plan = JSON.parse(jsonMatch[0]);
    res.json(plan);
  } catch (err) {
    console.error("Gemini Weekly Plan generation error:", err);
    res.status(500).json({
      message: "AI weekly plan service error",
      error: err.message || "Unknown error",
    });
  }
});

// Simple last 7 days summary
router.get("/summary", protect, async (req, res) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 7);

    const workouts = await WorkoutSession.find({
      user: req.user._id,
      date: { $gte: since },
    });

    const meals = await MealLog.find({
      user: req.user._id,
      date: { $gte: since },
    });

    res.json({ workouts, meals });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Record a completed workout session
router.post("/workout", protect, async (req, res) => {
  try {
    const { exercise, reps, durationMinutes, estimatedCalories, formScore } = req.body;
    const session = await WorkoutSession.create({
      user: req.user._id,
      exercise,
      reps,
      durationMinutes,
      estimatedCalories,
      formScore,
    });
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Record a meal log
router.post("/meal", protect, async (req, res) => {
  try {
    const { mealType, foodName, calories, protein, carbs, fats } = req.body;
    const log = await MealLog.create({
      user: req.user._id,
      mealType,
      foodName,
      calories,
      protein,
      carbs,
      fats,
    });
    res.json(log);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
