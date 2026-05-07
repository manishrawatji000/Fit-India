const mongoose = require("mongoose");

console.log("Connecting to local MongoDB...");
mongoose.connect("mongodb://localhost:27017/ai_fitness_trainer")
  .then(() => {
    console.log("SUCCESS: Local MongoDB connected flawlessly!");
    process.exit(0);
  })
  .catch(err => {
    console.error("FAILED to connect to local MongoDB:", err);
    process.exit(1);
  });
