const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const User = require("../models/User");
const protect = require("../middleware/authMiddleware");

// Initialize Razorpay
// We use placeholder logic if env variables are not present yet
const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "secret_placeholder",
  });
};

// @route   POST /api/payment/create-order
// @desc    Create a new Razorpay order based on plan
// @access  Public (Bypassed for Clerk Demo)
router.post("/create-order", async (req, res) => {
  try {
    const { plan } = req.body;
    let amount = 0;

    if (plan === "Pro") amount = 799;
    else if (plan === "Elite") amount = 1499;
    else return res.status(400).json({ message: "Invalid plan selected" });

    const razorpay = getRazorpayInstance();
    const options = {
      amount: amount * 100, // Razorpay works in paise
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    if (!order) return res.status(500).send("Some error occured");

    res.json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).send(error);
  }
});

// @route   POST /api/payment/verify
// @desc    Verify payment signature and upgrade user tier
// @access  Public (Bypassed for Clerk Demo)
router.post("/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
    } = req.body;

    const secret = process.env.RAZORPAY_KEY_SECRET || "secret_placeholder";

    // Verify signature
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    // Payment is successful! For this Clerk demo, we skip the MongoDB update
    // and just tell the frontend the payment was a success.
    res.json({
      message: "Payment verified successfully",
      tier: plan,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).send(error);
  }
});

module.exports = router;
