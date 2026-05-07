// frontend/src/pages/AICoach.jsx
import React, { useEffect } from "react";
import VoiceAssistant from "../components/VoiceAssistant.jsx";

const AICoach = () => {
  // Ensure page always loads at the very top, disregarding previous scroll state
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const suggestedQuestions = [
    { q: "What's the best workout for fat loss?",    icon: "🔥" },
    { q: "How much protein do I need daily?",         icon: "💪" },
    { q: "How do I fix bad squat form?",              icon: "🦵" },
    { q: "What should I eat before a workout?",       icon: "🥗" },
    { q: "How many rest days per week?",              icon: "😴" },
    { q: "What's the best way to build muscle fast?", icon: "⚡" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)",
      padding: "32px 36px 48px",
      fontFamily: "'DM Sans', system-ui, sans-serif",
      color: "#f1f5f9",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&display=swap');
        @keyframes coachFadeUp  { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        @keyframes coachShimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes coachFloat   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes coachGlow    { 0%,100%{box-shadow:0 0 0 0 rgba(66,133,244,0.45)} 50%{box-shadow:0 0 0 14px rgba(66,133,244,0)} }
        @keyframes coachPulse   { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
        @keyframes bounce       { 0%,80%,100%{transform:translateY(0);opacity:0.4} 40%{transform:translateY(-6px);opacity:1} }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
      `}</style>

      {/* ── Hero Banner ── */}
      <div style={{
        position: "relative", borderRadius: 28, overflow: "hidden",
        background: "linear-gradient(135deg, #060c1e 0%, #0d1630 40%, #081020 100%)",
        padding: "52px 48px", marginBottom: 40,
        border: "1px solid rgba(66,133,244,0.15)",
        boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
        animation: "coachFadeUp 0.7s ease both",
      }}>
        {/* Animated blobs */}
        <div style={{ position:"absolute", top:"-20%", right:"-5%", width:"50%", height:"180%",
          background:"radial-gradient(ellipse, rgba(66,133,244,0.2) 0%, transparent 65%)",
          pointerEvents:"none", animation:"coachFloat 7s ease-in-out infinite" }} />
        <div style={{ position:"absolute", bottom:"-30%", left:"-5%", width:"40%", height:"160%",
          background:"radial-gradient(ellipse, rgba(52,168,83,0.15) 0%, transparent 65%)",
          pointerEvents:"none", animation:"coachFloat 9s ease-in-out infinite reverse" }} />
        <div style={{ position:"absolute", top:"20%", left:"40%", width:"30%", height:"100%",
          background:"radial-gradient(ellipse, rgba(234,179,8,0.06) 0%, transparent 65%)",
          pointerEvents:"none" }} />

        <div style={{ position:"relative", zIndex:2, textAlign:"center" }}>
          {/* Badge */}
          <div style={{
            display:"inline-flex", alignItems:"center", gap:8,
            padding:"5px 16px", borderRadius:999,
            background:"rgba(66,133,244,0.1)", border:"1px solid rgba(66,133,244,0.3)",
            fontSize:11, fontWeight:700, color:"#60a5fa", letterSpacing:"0.12em",
            marginBottom:20, animation:"coachFadeUp 0.6s ease both",
          }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"#60a5fa",
              display:"inline-block", boxShadow:"0 0 8px #60a5fa", animation:"coachGlow 2s infinite" }} />
            POWERED BY GEMINI 2.5 FLASH
          </div>

          {/* Robot icon */}
          <div style={{
            width:80, height:80, borderRadius:"50%", margin:"0 auto 20px",
            background:"linear-gradient(135deg, #4285f4, #34a853)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:40,
            boxShadow:"0 12px 40px rgba(66,133,244,0.45)",
            animation:"coachPulse 3s ease-in-out infinite",
          }}>🤖</div>

          <h1 style={{
            fontFamily:"'Syne',sans-serif",
            fontSize:"clamp(30px,5vw,52px)", fontWeight:900,
            margin:"0 0 16px", lineHeight:1.1, letterSpacing:"-0.02em",
            animation:"coachFadeUp 0.7s ease 0.1s both",
          }}>
            Your{" "}
            <span style={{
              background:"linear-gradient(135deg,#4285f4 0%,#34a853 50%,#fbbc04 100%)",
              backgroundSize:"200% auto",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
              animation:"coachShimmer 4s linear infinite",
            }}>AI Fitness Coach</span>
          </h1>

          <p style={{
            fontSize:16, color:"#64748b", margin:"0 0 28px",
            maxWidth:560, marginLeft:"auto", marginRight:"auto",
            lineHeight:1.7,
            animation:"coachFadeUp 0.7s ease 0.2s both",
          }}>
            Ask anything about workouts, nutrition, form correction, or recovery.
            Your personal Gemini-powered coach with full conversation memory.
          </p>

          {/* Feature chips */}
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap", animation:"coachFadeUp 0.7s ease 0.3s both" }}>
            {[
              { icon:"🧠", text:"Gemini 2.5 Flash",      color:"#60a5fa" },
              { icon:"💬", text:"Multi-turn Memory",       color:"#34d399" },
              { icon:"🏋️", text:"Workout-Aware Context",  color:"#f97316" },
              { icon:"🎤", text:"Voice Input",             color:"#a78bfa" },
              { icon:"🔊", text:"Text-to-Speech",          color:"#fb923c" },
            ].map(chip => (
              <div key={chip.text} style={{
                display:"inline-flex", alignItems:"center", gap:6,
                padding:"8px 16px", borderRadius:999,
                background:`${chip.color}18`,
                border:`1px solid ${chip.color}40`,
                fontSize:13, fontWeight:600, color:chip.color,
              }}>
                <span>{chip.icon}</span><span>{chip.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main two-column layout ── */}
      <div style={{
        display:"grid",
        gridTemplateColumns:"1fr 340px",
        gap:24,
        alignItems:"start",
      }}>

        {/* ── Left: Full-sized VoiceAssistant ── */}
        <div style={{ animation:"coachFadeUp 0.7s ease 0.4s both" }}>
          <VoiceAssistant />
        </div>

        {/* ── Right: Suggested Questions + Tips ── */}
        <div style={{ display:"flex", flexDirection:"column", gap:20, animation:"coachFadeUp 0.7s ease 0.5s both" }}>

          {/* Suggested Questions */}
          <div style={{
            background:"rgba(15,23,42,0.7)", backdropFilter:"blur(20px)",
            borderRadius:24, padding:"24px 22px",
            border:"1px solid rgba(148,163,184,0.1)",
          }}>
            <div style={{ fontSize:14, fontWeight:800, color:"#e2e8f0", marginBottom:4 }}>
              💡 Suggested Questions
            </div>
            <div style={{ fontSize:12, color:"#475569", marginBottom:18 }}>
              Tap any question to ask your AI coach
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {suggestedQuestions.map((item, i) => (
                <div key={i} style={{
                  display:"flex", alignItems:"center", gap:10,
                  padding:"11px 14px", borderRadius:12,
                  background:"rgba(148,163,184,0.05)",
                  border:"1px solid rgba(148,163,184,0.1)",
                  cursor:"pointer",
                  fontSize:13, color:"#94a3b8",
                  transition:"all 0.2s",
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "rgba(66,133,244,0.1)";
                    e.currentTarget.style.borderColor = "rgba(66,133,244,0.3)";
                    e.currentTarget.style.color = "#93c5fd";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "rgba(148,163,184,0.05)";
                    e.currentTarget.style.borderColor = "rgba(148,163,184,0.1)";
                    e.currentTarget.style.color = "#94a3b8";
                  }}
                >
                  <span style={{ fontSize:16, flexShrink:0 }}>{item.icon}</span>
                  <span style={{ lineHeight:1.5 }}>{item.q}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Capabilities */}
          <div style={{
            background:"rgba(15,23,42,0.7)", backdropFilter:"blur(20px)",
            borderRadius:24, padding:"24px 22px",
            border:"1px solid rgba(148,163,184,0.1)",
          }}>
            <div style={{ fontSize:14, fontWeight:800, color:"#e2e8f0", marginBottom:16 }}>
              🤖 What I Can Help With
            </div>
            {[
              { icon:"🏋️", title:"Exercise & Form",    desc:"Technique tips, corrections, exercise variations" },
              { icon:"🥗", title:"Nutrition Advice",    desc:"Macros, meal timing, Indian diet recommendations" },
              { icon:"📊", title:"Progress Planning",   desc:"Goal setting, progressive overload, tracking" },
              { icon:"😴", title:"Recovery & Rest",     desc:"Sleep, soreness, injury prevention tips" },
            ].map((cap, i) => (
              <div key={i} style={{
                display:"flex", gap:12, marginBottom:14, alignItems:"flex-start",
              }}>
                <div style={{
                  width:36, height:36, borderRadius:10, flexShrink:0,
                  background:"rgba(66,133,244,0.1)",
                  border:"1px solid rgba(66,133,244,0.2)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:16,
                }}>{cap.icon}</div>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:"#e2e8f0", marginBottom:2 }}>{cap.title}</div>
                  <div style={{ fontSize:12, color:"#475569", lineHeight:1.5 }}>{cap.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Powered by */}
          <div style={{
            background:"linear-gradient(135deg, rgba(66,133,244,0.08), rgba(52,168,83,0.06))",
            backdropFilter:"blur(20px)",
            borderRadius:20, padding:"18px 20px",
            border:"1px solid rgba(66,133,244,0.15)",
            textAlign:"center",
          }}>
            <div style={{ fontSize:24, marginBottom:8 }}>✨</div>
            <div style={{ fontSize:12, fontWeight:700, color:"#60a5fa", marginBottom:4 }}>
              Gemini 2.5 Flash
            </div>
            <div style={{ fontSize:11, color:"#475569", lineHeight:1.6 }}>
              Google's latest AI model with<br />full conversation context memory
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICoach;
