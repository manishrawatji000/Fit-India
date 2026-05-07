const express = require("express");
const router = express.Router();
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const mongoose = require("mongoose");

// GET DB STATUS
router.get("/db-status", async (req, res) => {
  try {
    const isAtlas = mongoose.connection.host && mongoose.connection.host.includes("mongodb.net");
    res.json({
      connected: mongoose.connection.readyState === 1,
      dbType: isAtlas ? "Atlas Cloud" : "Local Fallback"
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching DB status" });
  }
});


// CLERK SYNC
router.post("/clerk-sync", async (req, res) => {
  const { name, email } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: name || email.split("@")[0],
        email,
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("CLERK SYNC ERROR:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// REGISTER
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    user = await User.create({ name, email, password });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
});

module.exports = router;


