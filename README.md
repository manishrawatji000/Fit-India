# FitIndia.ai 🏋️‍♂️🤖

FitIndia is a cutting-edge, AI-powered fitness application designed to bring elite personal training, dynamic meal planning, and real-time form tracking directly to your home. Built with the MERN stack and integrated with powerful AI models like Gemini and TensorFlow.js, FitIndia represents the future of personal fitness.

## 🚀 Key Features

* **Real-time AI Rep Tracking:** Uses **TensorFlow.js (MoveNet)** to analyze your body's skeleton through your webcam in real-time. It counts reps, checks your form (e.g., knee angles, elbow flares), and gives instant feedback without needing any sensors.
* **Dynamic AI Planners:** Powered by **Google Gemini 2.5**, the app generates hyper-personalized weekly workout and diet routines based on your exact body metrics, goals, and restrictions.
* **AI Voice Coach:** A built-in virtual assistant that you can talk to. It understands your fitness history and provides motivational and technical advice.
* **Premium Subscription Tiers:** Integrated securely with the **Razorpay SDK**. Features an elegant UI that locks advanced features behind a beautifully blurred "Pro Exclusive" glassmorphism paywall.
* **Secure Authentication:** User login and session management powered by **Clerk**.

## 🛠 Tech Stack

* **Frontend:** React.js, Vite, React Router
* **Backend:** Node.js, Express.js
* **Database:** MongoDB Atlas (Mongoose)
* **AI & Machine Learning:** Google Gemini API, TensorFlow.js (Pose Detection)
* **Payments:** Razorpay
* **Auth:** Clerk

## 📦 Installation & Setup

### 1. Clone the repository
Ensure you have Node.js and MongoDB installed on your system.

### 2. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory with the following variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_google_gemini_api_key
RAZORPAY_KEY_ID=your_razorpay_test_or_live_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```
Start the backend server:
```bash
npm start
```

### 3. Frontend Setup
Navigate to the frontend directory and install dependencies:
```bash
cd frontend
npm install
```
Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_GEMINI_API_KEY=your_google_gemini_api_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key
```
Start the Vite development server:
```bash
npm run dev
```

## 🔒 Pro Tier System
FitIndia features an advanced UI lock system. Certain exercises in the Workout catalog are marked as `isPro`. If a Basic user attempts to view them, the UI applies a CSS blur effect and blocks access until a Razorpay checkout is successfully completed.

---
*Built to make India fit, powered by modern AI.*
