# 🏋️ FitAI Trainer

An AI-powered fitness web application built with the MERN stack that provides
real-time pose detection, personalized diet planning, voice-based AI coaching,
and interactive workout progress tracking.

![FitAI Trainer](https://img.shields.io/badge/Status-Active-brightgreen)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express_v5-339933?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_v9-47A248?logo=mongodb)
![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-4.22.0-FF6F00?logo=tensorflow)

---

## 📌 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [How Pose Detection Works](#how-pose-detection-works)
- [Diet Calculation Engine](#diet-calculation-engine)
- [Screenshots](#screenshots)
- [Future Work](#future-work)
- [Team](#team)

---

## 🧠 Overview

FitAI Trainer solves a real problem — most people who work out at home 
have no way to know if their form is correct, and personal trainers are 
expensive. This application uses your webcam and a pose estimation AI 
model running entirely in the browser to:

- Watch you exercise in real time
- Count your reps automatically
- Give instant feedback on your form
- Generate personalized diet plans from your body metrics
- Let you talk to an AI fitness coach by voice

No server-side video processing. No GPU cloud costs. Everything runs 
on the client device using WebGL.

---

## ✨ Features

### 🤖 Real-Time AI Pose Detection
- MoveNet SinglePose Thunder model running in browser via TensorFlow.js
- ~30 FPS inference using WebGL backend
- 17 body keypoint detection with confidence score filtering
- Live skeleton overlay drawn on canvas over webcam feed
- Works entirely client-side — video never leaves the device

### 🏃 Exercise Analysis (8 Exercises)
| Exercise | Key Metrics Tracked |
|---|---|
| Squats | Knee angle, squat depth %, back posture, knee alignment |
| Push-Ups | Elbow angle, body alignment, depth |
| Lunges | Front knee angle, torso uprightness, knee-over-ankle |
| Bicep Curls | Elbow angle, range of motion %, elbow stability |
| Shoulder Press | Elbow angle, press progress, wrist position |
| Deadlift | Hip angle, back flatness, knee angle |
| Jumping Jacks | Arm raise angle, leg spread %, arm-leg sync |
| Lateral Raises | Arm elevation angle, elbow bend |

### 🎤 AI Voice Coach
- Web Speech API for speech-to-text input
- Claude API (claude-sonnet-4-20250514) for AI responses
- SpeechSynthesis API for text-to-speech output
- Local keyword-matching fallback for offline use
- Text input as fallback for unsupported browsers

### 🥗 Personalized Diet Planning
- Mifflin-St Jeor BMR equation implementation
- TDEE calculation with 5 activity level multipliers
- Goal-based caloric adjustment (lose / maintain / gain)
- Macro distribution (protein 30% / fats 25% / carbs 45%)
- 4-meal structured daily plan
- Macro visualization with Recharts PieChart

### 📊 Progress Dashboard
- 7-day workout and nutrition summary from MongoDB
- Area chart — calories burned trend
- Bar chart — daily protein intake
- Line chart — weekly activity frequency
- Radar chart — multi-dimensional performance score
- All charts animated on mount (2000ms duration)

### 🔐 Authentication
- Clerk OAuth integration (Google, Email/Password)
- Custom JWT middleware on Express backend
- Protected routes with PrivateRoute and PublicOnlyRoute guards
- 30-day token expiry with bcryptjs password hashing

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18.3.1 | UI framework |
| React Router | v6.30 | Client-side routing |
| Clerk | 5.61.3 | Authentication & OAuth |
| TensorFlow.js | 4.22.0 | ML inference in browser |
| @tensorflow-models/pose-detection | 2.1.3 | MoveNet model wrapper |
| @mediapipe/pose | 0.5 | MediaPipe runtime |
| Recharts | 3.5.1 | Animated data charts |
| Axios | 1.13.2 | HTTP client |
| Vite | 7.2.6 | Build tool |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | >=18 | Runtime |
| Express | 5.2.1 | Web framework |
| MongoDB | Atlas / Local | Database |
| Mongoose | 9.0.1 | ODM |
| bcryptjs | 3.0.3 | Password hashing |
| jsonwebtoken | 9.0.3 | JWT generation |
| cors | 2.8.5 | Cross-origin requests |
| dotenv | 17.2.3 | Environment config |

### AI / ML
| Model | Purpose |
|---|---|
| MoveNet SinglePose Thunder | High accuracy pose estimation |
| MoveNet SinglePose Lightning | Fast pose estimation (alternate) |
| Claude claude-sonnet-4-20250514 | AI voice coach responses |

---
---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:
```bash
Node.js >= 18.0.0
npm >= 8.0.0
MongoDB (local) or MongoDB Atlas account
```

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/fitai-trainer.git
cd fitai-trainer
```

### 2. Backend Setup
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Fill in your values (see Environment Variables section)

# Start the backend server
node server.js
# Server runs on http://localhost:5000
```

### 3. Frontend Setup
```bash
# Navigate to frontend (open new terminal)
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Fill in your Clerk publishable key

# Start the development server
npm run dev
# App runs on http://localhost:5173
```

### 4. Open the Application
