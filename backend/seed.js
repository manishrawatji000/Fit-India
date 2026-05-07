// backend/seed.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const User = require("./models/User");
const WorkoutSession = require("./models/WorkoutSession");
const MealLog = require("./models/MealLog");

dotenv.config();

const seedData = async () => {
  try {
    // 1. Connect to Database (Atlas or fallback to Local)
    await connectDB();

    // 2. Find User (find by active email or just get the first user in DB)
    const emailToFind = "manishrawatji000@gmail.com";
    let user = await User.findOne({ email: emailToFind });
    if (!user) {
      user = await User.findOne();
    }

    if (!user) {
      console.log("No user found in the database. Please sign in or sync a user first via the frontend!");
      process.exit(1);
    }

    console.log(`Found User: ${user.name} (${user.email}) - ID: ${user._id}`);

    // 3. Clean up existing workout sessions and meal logs for this user to avoid duplicates
    console.log("Cleaning up old workout sessions and meal logs...");
    await WorkoutSession.deleteMany({ user: user._id });
    await MealLog.deleteMany({ user: user._id });

    // 4. Generate 7 days of realistic history
    console.log("Generating 7 days of mock fitness history...");
    const workoutsToInsert = [];
    const mealsToInsert = [];

    const exercisesList = [
      { exercise: "squats", reps: 45, duration: 15, calories: 120, score: 92 },
      { exercise: "push-ups", reps: 36, duration: 12, calories: 95, score: 88 },
      { exercise: "lunges", reps: 40, duration: 15, calories: 110, score: 94 },
      { exercise: "diamond-push-ups", reps: 24, duration: 10, calories: 85, score: 85 },
      { exercise: "glute-bridge", reps: 50, duration: 15, calories: 100, score: 95 },
      { exercise: "bicep-curls", reps: 36, duration: 12, calories: 75, score: 90 },
      { exercise: "squats", reps: 50, duration: 18, calories: 140, score: 96 }
    ];

    const mealsList = [
      { name: "Oatmeal with Milk & Nuts", protein: 18, carbs: 55, fats: 10, calories: 380, type: "breakfast" },
      { name: "Grilled Chicken & Rice", protein: 45, carbs: 65, fats: 12, calories: 680, type: "lunch" },
      { name: "Sprouts Salad & Green Tea", protein: 12, carbs: 25, fats: 2, calories: 180, type: "snack" },
      { name: "Paneer Tikka or Lentil Soup", protein: 28, carbs: 35, fats: 14, calories: 420, type: "dinner" }
    ];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      // Add workout for today (some days might be rest days, let's keep it highly active with 5 workouts)
      if (i !== 3 && i !== 5) {
        const ex = exercisesList[6 - i];
        workoutsToInsert.push({
          user: user._id,
          exercise: ex.exercise,
          reps: ex.reps,
          durationMinutes: ex.duration,
          estimatedCalories: ex.calories,
          formScore: ex.score,
          date: new Date(date)
        });
      }

      // Add daily meals
      mealsList.forEach(m => {
        mealsToInsert.push({
          user: user._id,
          mealType: m.type,
          foodName: m.name,
          calories: m.calories,
          protein: m.protein,
          carbs: m.carbs,
          fats: m.fats,
          date: new Date(date)
        });
      });
    }

    console.log(`Inserting ${workoutsToInsert.length} workout sessions...`);
    await WorkoutSession.insertMany(workoutsToInsert);

    console.log(`Inserting ${mealsToInsert.length} meal logs...`);
    await MealLog.insertMany(mealsToInsert);

    console.log("SUCCESS: Database seeded flawlessly! Your Progress page charts are ready!");
    process.exit(0);
  } catch (err) {
    console.error("Critical error during seeding:", err);
    process.exit(1);
  }
};

seedData();
