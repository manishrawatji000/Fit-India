// backend/check-user-sessions.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const User = require("./models/User");
const WorkoutSession = require("./models/WorkoutSession");
const MealLog = require("./models/MealLog");

dotenv.config();

const runCheck = async () => {
  try {
    await connectDB();

    console.log("\n--- Database Check ---");
    const usersCount = await User.countDocuments();
    console.log(`Total Users in DB: ${usersCount}`);

    const users = await User.find();
    users.forEach(u => {
      console.log(`- User: ${u.name} | Email: ${u.email} | ID: ${u._id}`);
    });

    const workoutsCount = await WorkoutSession.countDocuments();
    console.log(`Total WorkoutSessions: ${workoutsCount}`);
    if (workoutsCount > 0) {
      const sampleWorkout = await WorkoutSession.findOne();
      console.log(`Sample WorkoutSession User ID: ${sampleWorkout.user}`);
    }

    const mealsCount = await MealLog.countDocuments();
    console.log(`Total MealLogs: ${mealsCount}`);
    if (mealsCount > 0) {
      const sampleMeal = await MealLog.findOne();
      console.log(`Sample MealLog User ID: ${sampleMeal.user}`);
    }

    console.log("-----------------------\n");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

runCheck();
