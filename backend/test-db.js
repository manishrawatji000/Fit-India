// backend/test-db.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

console.log("Connecting to:", process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("SUCCESS: Connected to MongoDB Atlas perfectly!");
    process.exit(0);
  })
  .catch(err => {
    console.error("ERROR CONNECTING TO MONGO ATLAS:");
    console.error(err);
    process.exit(1);
  });
