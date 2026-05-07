const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Attempt connecting to MongoDB Atlas first with a 3-second timeout
    console.log("Attempting to connect to MongoDB Atlas...");
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 3000
    });
    console.log("MongoDB Atlas connected successfully!");
  } catch (err) {
    console.warn("MongoDB Atlas connection blocked or timed out (IP whitelist issue).");
    console.log("Falling back to active Local MongoDB Server...");
    try {
      await mongoose.connect("mongodb://localhost:27017/ai_fitness_trainer");
      console.log("SUCCESS: Fallback Local MongoDB connected flawlessly!");
    } catch (localErr) {
      console.error("Critical: Both Atlas and Local MongoDB connection failed!");
      console.error(localErr.message);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
