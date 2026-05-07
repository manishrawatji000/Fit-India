// frontend/src/pages/Workout.jsx
import React, { useState, useRef, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import * as poseDetection from "@tensorflow-models/pose-detection";
import VoiceAssistant from "../components/VoiceAssistant.jsx";
import API from "../api.js";
import { CATEGORIES, exercises } from "../utils/exercises.js";

// --- Pose helpers -------------------------------------------------------------
const getKp = (kps, name, idx) => kps?.find?.(k => k.name === name) ?? kps?.[idx] ?? null;

const calcAngle = (A, B, C) => {
  if (!A || !B || !C) return null;
  const AB = { x: A.x - B.x, y: A.y - B.y };
  const CB = { x: C.x - B.x, y: C.y - B.y };
  const dot = AB.x * CB.x + AB.y * CB.y;
  const mag = Math.hypot(AB.x, AB.y) * Math.hypot(CB.x, CB.y);
  if (!mag) return null;
  return (Math.acos(Math.min(1, Math.max(-1, dot / mag))) * 180) / Math.PI;
};

const avg = (...vals) => {
  const v = vals.filter(x => x != null);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
};

// --- Exercise-aware angle extraction -----------------------------------------
const getExerciseAngle = (ex, kps) => {
  const g = (name, idx) => getKp(kps, name, idx);
  switch (ex.angleType) {
    case 'elbow': {
      const l = calcAngle(g('left_shoulder',5), g('left_elbow',7), g('left_wrist',9));
      const r = calcAngle(g('right_shoulder',6), g('right_elbow',8), g('right_wrist',10));
      return avg(l, r);
    }
    case 'elbowCurl': {
      const l = calcAngle(g('left_shoulder',5), g('left_elbow',7), g('left_wrist',9));
      const r = calcAngle(g('right_shoulder',6), g('right_elbow',8), g('right_wrist',10));
      return avg(l, r);
    }
    case 'knee': {
      const l = calcAngle(g('left_hip',11), g('left_knee',13), g('left_ankle',15));
      const r = calcAngle(g('right_hip',12), g('right_knee',14), g('right_ankle',16));
      return avg(l, r);
    }
    case 'hip': {
      const l = calcAngle(g('left_shoulder',5), g('left_hip',11), g('left_knee',13));
      const r = calcAngle(g('right_shoulder',6), g('right_hip',12), g('right_knee',14));
      return avg(l, r);
    }
    case 'trunk': {
      const ls = g('left_shoulder',5); const lh = g('left_hip',11);
      const rs = g('right_shoulder',6); const rh = g('right_hip',12);
      if (!ls || !lh) return null;
      const sy = ((ls.y + (rs?.y ?? ls.y)) / 2);
      const hy = ((lh.y + (rh?.y ?? lh.y)) / 2);
      return 90 + (hy - sy) * 0.5;
    }
    case 'kneeRaise': {
      const l = calcAngle(g('left_hip',11), g('left_knee',13), g('left_ankle',15));
      const r = calcAngle(g('right_hip',12), g('right_knee',14), g('right_ankle',16));
      return avg(l, r);
    }
    default: return null;
  }
};

// --- Feedback per exercise ----------------------------------------------------
const getFeedback = (ex, angle) => {
  if (angle == null) return { text: 'Position yourself in frame', quality: 0 };
  const d = ex.downThreshold, u = ex.upThreshold;
  const isCurl = ex.angleType === 'elbowCurl';
  if (isCurl) {
    if (angle < 40)  return { text: 'Too much - ease back slightly!', quality: 30 };
    if (angle <= d / 2.5) return { text: 'Full curl! Squeeze the bicep!', quality: 100 };
    if (angle <= u)  return { text: 'Standing - curl up fully!', quality: 80 };
    return { text: 'Lower the weight fully for full range!', quality: 60 };
  }
  if (angle < d - 30) return { text: 'Too deep - protect your joints!', quality: 20 };
  if (angle <= d)     return { text: 'Perfect depth! Push back up!', quality: 100 };
  if (angle <= (d + u) / 2) return { text: 'Good - a little deeper!', quality: 75 };
  if (angle <= u)     return { text: 'Lower yourself down!', quality: 50 };
  return { text: 'Ready position - begin your rep!', quality: 80 };
};

// --- Draw skeleton ------------------------------------------------------------
const SKELETON_PAIRS = [
  [5,7],[7,9],[6,8],[8,10],[5,6],[5,11],[6,12],[11,12],
  [11,13],[13,15],[12,14],[14,16]
];
const drawSkeleton = (ctx, kps, color) => {
  if (!kps) return;
  SKELETON_PAIRS.forEach(([a, b]) => {
    const A = kps[a], B = kps[b];
    if (!A || !B) return;
    if ((A.score ?? 1) < 0.25 || (B.score ?? 1) < 0.25) return;
    ctx.beginPath();
    ctx.moveTo(A.x, A.y);
    ctx.lineTo(B.x, B.y);
    ctx.strokeStyle = color + '99';
    ctx.lineWidth = 3;
    ctx.stroke();
  });
  kps.forEach(kp => {
    if (!kp || (kp.score ?? 1) < 0.25) return;
    ctx.beginPath();
    ctx.arc(kp.x, kp.y, 7, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
  });
};

// --- EXERCISE SELECTION COMPONENT --------------------------------------------
const ExerciseSelection = ({ onSelectExercise }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selected, setSelected] = useState(null);
  const [metrics, setMetrics] = useState({ goal: "maintain", weightKg: 70 });
  const [weeklyPlan, setWeeklyPlan] = useState([]);
  const [loadingPlan, setLoadingPlan] = useState(true);
  
  const daysOfWeekNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentDayIndex = new Date().getDay();
  const [selectedDay, setSelectedDay] = useState(daysOfWeekNames[currentDayIndex]);

  useEffect(() => {
    const loadPlan = () => {
      setLoadingPlan(true);
      // Load metrics
      API.get("/diet/metrics")
        .then(res => {
          if (res.data) setMetrics(res.data);
        })
        .catch(() => {});

      // Load dynamic Gemini weekly plan
      API.get("/progress/weekly-plan")
        .then(res => {
          if (Array.isArray(res.data)) {
            setWeeklyPlan(res.data);
          }
          setLoadingPlan(false);
        })
        .catch(err => {
          console.error("Failed to load AI weekly plan:", err);
          setWeeklyPlan([
            {
              day: "Sunday",
              exercises: [
                { exId: "glute-bridge", sets: 3, reps: 15, notes: "Squeeze glutes at top" },
                { exId: "squats", sets: 4, reps: 15, notes: "Build core and thigh strength" },
                { exId: "calf-raises", sets: 3, reps: 20, notes: "Rise high on your toes" },
                { exId: "lunges", sets: 3, reps: 12, notes: "Focus on balance and hip flexors" }
              ]
            },
            {
              day: "Monday",
              exercises: [
                { exId: "push-ups", sets: 3, reps: 12, notes: "Keep elbows close to body" },
                { exId: "diamond-push-ups", sets: 3, reps: 10, notes: "Form diamond with hands" },
                { exId: "wide-push-ups", sets: 3, reps: 12, notes: "Focus on outer chest activation" },
                { exId: "pike-push-ups", sets: 3, reps: 10, notes: "Slightly elevate hips for shoulder load" }
              ]
            },
            {
              day: "Tuesday",
              exercises: [
                { exId: "squats", sets: 4, reps: 15, notes: "Keep chest up and hips back" },
                { exId: "lunges", sets: 3, reps: 12, notes: "Lower back knee near floor" },
                { exId: "sumo-squats", sets: 3, reps: 15, notes: "Wide stance for inner thigh focus" },
                { exId: "jump-squats", sets: 3, reps: 12, notes: "Explode upwards for power" }
              ]
            },
            {
              day: "Wednesday",
              exercises: [
                { exId: "superman", sets: 3, reps: 15, notes: "Hold for 2 seconds at top" },
                { exId: "bird-dog", sets: 3, reps: 12, notes: "Extend opposite arm and leg" },
                { exId: "good-mornings", sets: 3, reps: 15, notes: "Hinge at your hips with back flat" },
                { exId: "back-extension", sets: 3, reps: 12, notes: "Keep movements controlled" }
              ]
            },
            {
              day: "Thursday",
              exercises: [
                { exId: "bicep-curls", sets: 3, reps: 12, notes: "Elbows stationary at sides" },
                { exId: "tricep-dips", sets: 3, reps: 15, notes: "Lower until elbows are 90 degrees" },
                { exId: "hammer-curls", sets: 3, reps: 12, notes: "Neutral grip for forearm thickness" },
                { exId: "push-ups", sets: 3, reps: 15, notes: "Finisher for upper body pump" }
              ]
            },
            {
              day: "Friday",
              exercises: [
                { exId: "squats", sets: 3, reps: 15, notes: "Keep back straight" },
                { exId: "calf-raises", sets: 3, reps: 20, notes: "Rise high on your toes" },
                { exId: "lunges", sets: 3, reps: 12, notes: "Controlled step down" },
                { exId: "glute-bridge", sets: 4, reps: 15, notes: "Hold contraction at the top" }
              ]
            },
            {
              day: "Saturday",
              exercises: [
                { exId: "push-ups", sets: 3, reps: 12, notes: "Maintain solid straight body line" },
                { exId: "pike-push-ups", sets: 3, reps: 10, notes: "Focus on shoulder push strength" },
                { exId: "diamond-push-ups", sets: 3, reps: 10, notes: "Form diamond with hands" },
                { exId: "wide-push-ups", sets: 3, reps: 12, notes: "Focus on chest stretch" }
              ]
            }
          ]);
          setLoadingPlan(false);
        });
    };

    loadPlan();

    const handleSync = () => {
      loadPlan();
    };

    window.addEventListener("user-synced", handleSync);
    return () => window.removeEventListener("user-synced", handleSync);
  }, []);

  const filtered = activeCategory === 'all'
    ? exercises
    : exercises.filter(e => e.category === activeCategory);

  const selectedDayPlan = weeklyPlan.find(item => item.day === selectedDay);

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@800;900&display=swap');
        @keyframes wFadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes wShimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes wGlow{0%,100%{box-shadow:0 0 0 0 rgba(141,198,63,0.4)}50%{box-shadow:0 0 0 10px rgba(141,198,63,0)}}
        @keyframes wFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes wPulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
      `}</style>

      {/* Hero Banner */}
      <div style={{position:'relative',borderRadius:28,overflow:'hidden',
        background:'linear-gradient(135deg,#0f0a1e,#1a0a2e,#0a0f1e)',
        padding:'52px 48px',marginBottom:36,
        border:'1px solid rgba(255,107,157,0.15)',
        boxShadow:'0 32px 80px rgba(0,0,0,0.5)'}}>
        <div style={{position:'absolute',top:'-20%',right:'-5%',width:'45%',height:'180%',
          background:'radial-gradient(ellipse,rgba(255,107,157,0.18) 0%,transparent 65%)',
          pointerEvents:'none',animation:'wFloat 6s ease-in-out infinite'}}/>
        <div style={{position:'absolute',bottom:'-30%',left:'-5%',width:'40%',height:'160%',
          background:'radial-gradient(ellipse,rgba(79,172,254,0.15) 0%,transparent 65%)',
          pointerEvents:'none',animation:'wFloat 8s ease-in-out infinite reverse'}}/>
        <div style={{position:'relative',zIndex:2,textAlign:'center'}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'5px 16px',
            borderRadius999:999,borderRadius:999,background:'rgba(141,198,63,0.1)',border:'1px solid rgba(141,198,63,0.3)',
            fontSize:11,fontWeight:700,color:'#8DC63F',letterSpacing:'0.12em',marginBottom:20,animation:'wFadeUp 0.6s ease both'}}>
            <span style={{width:6,height:6,borderRadius:'50%',background:'#8DC63F',display:'inline-block',boxShadow:'0 0 8px #8DC63F',animation:'wGlow 2s infinite'}}/>
            DYNAMIC GEMINI 2.5 AI PROGRAMMING ACTIVE
          </div>
          <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:'clamp(30px,5vw,52px)',fontWeight:900,
            margin:'0 0 14px',lineHeight:1.1,letterSpacing:'-0.02em',animation:'wFadeUp 0.7s ease 0.1s both'}}>
            <span style={{background:'linear-gradient(135deg,#8DC63F,#5A9010,#22d3ee)',backgroundSize:'200% auto',
              WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',animation:'wShimmer 4s linear infinite'}}>
              AI Weekly Planner
            </span>
          </h1>
          <p style={{fontSize:15,color:'#94a3b8',margin:'0 0 24px',animation:'wFadeUp 0.7s ease 0.2s both'}}>
            Suggested daily routines tailored specifically to your body metrics and fitness goals. Click any card to launch the AI Trainer!
          </p>
        </div>
      </div>

      {loadingPlan ? (
        <div style={{
          background: "rgba(15,23,42,0.4)", border: "1px solid rgba(141,198,63,0.15)",
          borderRadius: 24, padding: "48px 24px", textAlign: "center", marginBottom: 36
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            border: "3px solid rgba(141,198,63,0.15)", borderTop: "3px solid #8DC63F",
            animation: "spin 0.75s linear infinite", margin: "0 auto 16px"
          }} />
          <div style={{ fontSize: 15, fontWeight: 700, color: "#8DC63F" }}>Gemini is designing your custom workout program...</div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>Analyzing weight, height, age, and saved targets to calculate ideal muscle splits.</div>
        </div>
      ) : (
        <>
          {/* Daily Calendar Selectors */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
            gap: 12,
            marginBottom: 24,
            animation: "wFadeUp 0.7s ease both"
          }}>
            {daysOfWeekNames.map((dayName, idx) => {
              const isToday = daysOfWeekNames[currentDayIndex] === dayName;
              const isSelected = selectedDay === dayName;
              const dayItem = weeklyPlan.find(item => item.day === dayName);
              const numExercises = dayItem?.exercises?.length || 0;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDay(dayName)}
                  style={{
                    background: isSelected ? "rgba(141,198,63,0.15)" : "rgba(15,23,42,0.65)",
                    border: isSelected ? "2px solid #8DC63F" : isToday ? "1px solid rgba(141,198,63,0.4)" : "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 16,
                    padding: "16px 10px",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    boxShadow: isSelected ? "0 0 16px rgba(141,198,63,0.15)" : "none",
                    position: "relative"
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 800, color: isSelected ? "#8DC63F" : "#64748b", textTransform: "uppercase" }}>{dayName.slice(0, 3)}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#cbd5e1", marginTop: 6 }}>{numExercises} {numExercises === 1 ? "Lift" : "Lifts"}</div>
                  {isToday && (
                    <span style={{
                      position: "absolute", top: 6, right: 6,
                      fontSize: 8, background: "#8DC63F", color: "#020617",
                      padding: "2px 5px", borderRadius: 99, fontWeight: 900
                    }}>TODAY</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Suggested Workouts for Selected Day */}
          <div style={{ marginBottom: 40, animation: "wFadeUp 0.6s ease both" }}>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, color: "#e2e8f0", marginBottom: 16, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 8 }}>
              🏋️ Dynamic Suggestions for {selectedDay}
            </h3>

            {selectedDayPlan?.exercises?.length === 0 ? (
              <div style={{ color: "#64748b", textAlign: "center", padding: "24px 0" }}>Active Rest Day! Do some light walking or stretching.</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
                {selectedDayPlan?.exercises?.map((item, index) => {
                  const ex = exercises.find(e => e.id === item.exId) || exercises[0];
                  return (
                    <div
                      key={index}
                      style={{
                        background: "rgba(15,23,42,0.65)",
                        border: "1px solid rgba(141,198,63,0.15)",
                        borderRadius: 20,
                        padding: "18px 24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 16
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{
                          width: 52, height: 52, borderRadius: 14,
                          background: ex.gradient, display: "flex",
                          alignItems: "center", justifyContent: "center", fontSize: 26,
                          boxShadow: `0 6px 16px ${ex.color}35`
                        }}>{ex.icon}</div>
                        <div>
                          <div style={{ fontSize: 16, fontWeight: 800, color: "#f1f5f9" }}>{ex.name}</div>
                          <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginTop: 2 }}>{ex.targetMuscles}</div>
                          <div style={{ fontSize: 11, color: "#8DC63F", fontWeight: 700, fontStyle: "italic", marginTop: 4 }}>💡 Tip: {item.notes}</div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                        <div style={{ background: "rgba(0,0,0,0.3)", padding: "10px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.04)", textAlign: "center" }}>
                          <span style={{ fontSize: 11, color: "#64748b", fontWeight: 700, display: "block" }}>RECOMMENDED WORK</span>
                          <span style={{ fontSize: 15, fontWeight: 900, color: "#fb923c" }}>{item.sets} Sets × {item.reps} Reps</span>
                        </div>

                        <button
                          onClick={() => onSelectExercise(ex)}
                          style={{
                            padding: "12px 24px",
                            borderRadius: 14,
                            border: "none",
                            background: ex.gradient,
                            color: "#fff",
                            fontWeight: 800,
                            fontSize: 13,
                            cursor: "pointer",
                            boxShadow: `0 6px 16px ${ex.color}40`,
                            transition: "all 0.25s"
                          }}
                          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
                        >
                          Start AI Tracker
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Category Tabs */}
      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:28,padding:'0 4px'}}>
        {CATEGORIES.map(cat=>(
          <button key={cat.id} onClick={()=>setActiveCategory(cat.id)}
            style={{display:'flex',alignItems:'center',gap:6,padding:'9px 18px',borderRadius:12,border:'none',
              cursor:'pointer',fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,transition:'all 0.22s',
              background:activeCategory===cat.id?`${cat.color}20`:'rgba(15,23,42,0.6)',
              color:activeCategory===cat.id?cat.color:'#64748b',
              boxShadow:activeCategory===cat.id?`0 0 0 1.5px ${cat.color}60`:'none'}}>
            <span>{cat.icon}</span><span>{cat.label}</span>
            <span style={{fontSize:10,padding:'2px 6px',borderRadius:99,
              background:activeCategory===cat.id?`${cat.color}25`:'rgba(148,163,184,0.1)',
              color:activeCategory===cat.id?cat.color:'#475569'}}>
              {cat.id==='all'?exercises.length:exercises.filter(e=>e.category===cat.id).length}
            </span>
          </button>
        ))}
      </div>

      {/* Exercise Grid */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:18,marginBottom:100}}>
        {filtered.map((ex,i)=>(
          <div key={ex.id} onClick={()=>setSelected(ex)}
            style={{background:selected?.id===ex.id?`${ex.color}12`:'rgba(15,23,42,0.75)',
              backdropFilter:'blur(20px)',borderRadius:20,padding:22,cursor:'pointer',
              border:selected?.id===ex.id?`2px solid ${ex.color}80`:'1px solid rgba(148,163,184,0.12)',
              boxShadow:selected?.id===ex.id?`0 16px 48px ${ex.color}30`:'0 4px 20px rgba(0,0,0,0.3)',
              transition:'all 0.28s ease',animation:`wFadeUp 0.5s ease ${i*0.04}s both`,position:'relative',overflow:'hidden'}}
            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow=`0 20px 50px ${ex.color}35`}}
            onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow=selected?.id===ex.id?`0 16px 48px ${ex.color}30`:'0 4px 20px rgba(0,0,0,0.3)'}}>
            <div style={{position:'absolute',top:0,right:0,width:'55%',height:'100%',
              background:ex.gradient,opacity:0.07,filter:'blur(30px)',pointerEvents:'none',borderRadius:'50%'}}/>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
              <div style={{width:52,height:52,borderRadius:14,background:ex.gradient,display:'flex',
                alignItems:'center',justifyContent:'center',fontSize:26,boxShadow:`0 6px 20px ${ex.color}50`}}>
                {ex.icon}
              </div>
              <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:6}}>
                <span style={{fontSize:10,fontWeight:700,padding:'3px 10px',borderRadius:99,
                  background:`${ex.color}18`,border:`1px solid ${ex.color}35`,color:ex.color}}>
                  {ex.level}
                </span>
                {CATEGORIES.find(c=>c.id===ex.category) && (
                  <span style={{fontSize:9,fontWeight:600,padding:'2px 8px',borderRadius:99,
                    background:`${CATEGORIES.find(c=>c.id===ex.category).color}15`,
                    color:CATEGORIES.find(c=>c.id===ex.category).color,
                    border:`1px solid ${CATEGORIES.find(c=>c.id===ex.category).color}30`}}>
                    {CATEGORIES.find(c=>c.id===ex.category).label}
                  </span>
                )}
              </div>
            </div>
            <h3 style={{fontSize:18,fontWeight:800,margin:'0 0 6px',color:'#f1f5f9'}}>{ex.name}</h3>
            <div style={{display:'flex',alignItems:'center',gap:5,marginBottom:10}}>
              <span style={{width:6,height:6,borderRadius:'50%',background:ex.color,flexShrink:0}}/>
              <span style={{fontSize:11,color:'#94a3b8',fontWeight:600}}>{ex.targetMuscles}</span>
            </div>
            <p style={{fontSize:12,color:'#64748b',lineHeight:1.6,margin:'0 0 14px'}}>{ex.description}</p>
            <div style={{background:'rgba(0,0,0,0.3)',borderRadius:10,padding:'10px 12px',border:'1px solid rgba(148,163,184,0.08)'}}>
              {ex.keyPoints.slice(0,2).map((tip,j)=>(
                <div key={j} style={{display:'flex',alignItems:'flex-start',gap:7,marginBottom:j<1?6:0}}>
                  <span style={{color:ex.color,fontSize:12,marginTop:1,flexShrink:0}}></span>
                  <span style={{fontSize:11,color:'#cbd5e1',lineHeight:1.5}}>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Floating Start Button */}
      {selected && (
        <div style={{position:'fixed',bottom:32,left:'50%',transform:'translateX(-50%)',zIndex:200,animation:'slideUp 0.3s ease'}}>
          <button onClick={()=>onSelectExercise(selected)}
            style={{padding:'18px 44px',fontSize:16,fontWeight:800,color:'white',background:selected.gradient,
              border:'none',borderRadius:16,cursor:'pointer',boxShadow:`0 12px 40px ${selected.color}60`,
              display:'flex',alignItems:'center',gap:12,transition:'all 0.3s',letterSpacing:'0.03em'}}
            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow=`0 18px 50px ${selected.color}80`}}
            onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow=`0 12px 40px ${selected.color}60`}}>
            <span style={{fontSize:22}}>{selected.icon}</span>
            Start {selected.name} 
          </button>
        </div>
      )}
    </div>
  );
};

// --- WORKOUT SESSION COMPONENT ---
const WorkoutSession = ({ exercise, onBack }) => {
  const videoRef = useRef(null), canvasRef = useRef(null);
  const detectorRef = useRef(null), rafRef = useRef(null);
  const [status, setStatus] = useState("Loading AI model...");
  const [reps, setReps] = useState(0);
  const [formFeedback, setFormFeedback] = useState("Position yourself in frame");
  const [jointAngle, setJointAngle] = useState("--");
  const [formQuality, setFormQuality] = useState(0);
  const [calories, setCalories] = useState(0);
  const [duration, setDuration] = useState(0);
  const repState = useRef("up"), lastRepTime = useRef(0);
  const angleWindow = useRef([]), startTime = useRef(Date.now());

  useEffect(() => {
    let mounted = true;
    const timer = setInterval(() => {
      const d = Math.floor((Date.now() - startTime.current) / 1000);
      setDuration(d); setCalories(Math.floor(reps * 5.5 + d * 0.12));
    }, 1000);
    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video:{width:640,height:480}, audio:false });
        if (!mounted) { stream.getTracks().forEach(t=>t.stop()); return; }
        videoRef.current.srcObject = stream; await videoRef.current.play();
        try { await tf.setBackend("webgl"); await tf.ready(); } catch { await tf.ready(); }
        const det = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet,
          { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING });
        detectorRef.current = det; setStatus("AI Ready - Start exercising!");
        rafRef.current = requestAnimationFrame(loop);
      } catch (err) { setStatus("Camera error: " + (err.message || err)); }
    };
    const loop = async () => {
      if (!detectorRef.current || !videoRef.current) { rafRef.current = requestAnimationFrame(loop); return; }
      try {
        const poses = await detectorRef.current.estimatePoses(videoRef.current, {maxPoses:1,flipHorizontal:true});
        const ctx = canvasRef.current.getContext("2d");
        ctx.clearRect(0,0,640,480); ctx.drawImage(videoRef.current,0,0,640,480);
        if (!poses?.length) { setFormFeedback("Move into frame"); setFormQuality(0); setJointAngle("--"); }
        else {
          const kps = poses[0].keypoints;
          drawSkeleton(ctx, kps, exercise.color);
          const angle = getExerciseAngle(exercise, kps);
          if (angle == null) { setFormFeedback("Adjust camera"); setFormQuality(0); setJointAngle("--"); }
          else {
            angleWindow.current.push(angle);
            if (angleWindow.current.length > 6) angleWindow.current.shift();
            const avgA = Math.round(angleWindow.current.reduce((a,b)=>a+b,0)/angleWindow.current.length);
            setJointAngle(avgA);
            const fb = getFeedback(exercise, avgA); setFormFeedback(fb.text); setFormQuality(fb.quality);
            const now = Date.now(), {downThreshold:D, upThreshold:U, angleType} = exercise;
            const isCurl = angleType === 'elbowCurl';
            if (!isCurl) {
              if (avgA <= D && repState.current === "up") repState.current = "down";
              if (avgA >= U && repState.current === "down" && now - lastRepTime.current > 700) {
                lastRepTime.current = now; repState.current = "up";
                setReps(r => r + 1); setFormFeedback("Rep counted!");
              }
            } else {
              if (avgA >= D && repState.current === "up") repState.current = "down";
              if (avgA <= U && repState.current === "down" && now - lastRepTime.current > 700) {
                lastRepTime.current = now; repState.current = "up";
                setReps(r => r + 1); setFormFeedback("Rep counted!");
              }
            }
          }
        }
      } catch {}
      rafRef.current = requestAnimationFrame(loop);
    };
    init();
    return () => { mounted=false; clearInterval(timer); if(rafRef.current)cancelAnimationFrame(rafRef.current);
      videoRef.current?.srcObject?.getTracks().forEach(t=>t.stop()); try{detectorRef.current?.dispose?.();}catch{} };
  }, []);

  const fmt = s => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;
  return (
    <div>
      <div style={{marginBottom:20,display:'flex',alignItems:'center',gap:16}}>
        <button onClick={onBack} style={{padding:'10px 20px',background:'rgba(239,68,68,0.15)',
          border:'1px solid rgba(239,68,68,0.4)',borderRadius:12,color:'#fca5a5',fontWeight:700,cursor:'pointer',fontSize:13}}>Back</button>
        <div style={{flex:1}}>
          <h2 style={{fontSize:28,fontWeight:900,margin:0,background:exercise.gradient,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{exercise.name}</h2>
          <p style={{margin:'3px 0 0',color:'#94a3b8',fontSize:13}}>{status}</p>
        </div>
        <div style={{display:'flex',gap:8}}>
          {[{l:'Muscles',v:exercise.targetMuscles},{l:'Level',v:exercise.level}].map(b=>(
            <div key={b.l} style={{textAlign:'center',padding:'8px 14px',borderRadius:12,background:`${exercise.color}12`,border:`1px solid ${exercise.color}30`}}>
              <div style={{fontSize:10,color:'#64748b',fontWeight:700,marginBottom:3}}>{b.l}</div>
              <div style={{fontSize:12,fontWeight:700,color:exercise.color}}>{b.v}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 360px',gap:20}}>
        <div>
          <div style={{position:'relative',borderRadius:24,overflow:'hidden',background:'rgba(15,23,42,0.9)',border:`1px solid ${exercise.color}30`,boxShadow:`0 20px 60px ${exercise.color}20`}}>
            <video ref={videoRef} width={640} height={480} playsInline style={{display:'block',transform:'scaleX(-1)'}}/>
            <canvas ref={canvasRef} width={640} height={480} style={{position:'absolute',left:0,top:0}}/>
            <div style={{position:'absolute',top:16,left:16,display:'flex',gap:10}}>
              {[{l:'REPS',v:reps,c:exercise.color},{l:'ANGLE',v:`${jointAngle}deg`,c:'#4facfe'}].map(s=>(
                <div key={s.l} style={{background:'rgba(5,12,30,0.92)',backdropFilter:'blur(20px)',padding:'12px 18px',borderRadius:14,border:`1px solid ${s.c}40`}}>
                  <div style={{fontSize:10,color:'#94a3b8',fontWeight:700,marginBottom:3}}>{s.l}</div>
                  <div style={{fontSize:32,fontWeight:900,color:s.c,lineHeight:1}}>{s.v}</div>
                </div>
              ))}
            </div>
            <div style={{position:'absolute',right:16,top:80,background:'rgba(5,12,30,0.92)',backdropFilter:'blur(20px)',padding:'16px 14px',borderRadius:14,border:'1px solid rgba(148,163,184,0.15)',width:130,textAlign:'center'}}>
              <div style={{fontSize:10,color:'#94a3b8',fontWeight:700,marginBottom:10}}>FORM QUALITY</div>
              <div style={{height:160,background:'rgba(148,163,184,0.15)',borderRadius:12,overflow:'hidden',position:'relative',marginBottom:8}}>
                <div style={{position:'absolute',bottom:0,width:'100%',height:`${formQuality}%`,background:formQuality>80?'linear-gradient(to top,#22c55e,#4ade80)':formQuality>50?'linear-gradient(to top,#f59e0b,#fbbf24)':'linear-gradient(to top,#ef4444,#f97316)',borderRadius:12,transition:'height 0.4s ease'}}/>
              </div>
              <div style={{fontSize:24,fontWeight:900,color:formQuality>80?'#22c55e':formQuality>50?'#f59e0b':'#ef4444'}}>{formQuality}%</div>
            </div>
          </div>
          <div style={{marginTop:16,padding:'18px 24px',background:exercise.gradient,borderRadius:18,textAlign:'center',fontSize:17,fontWeight:800,color:'white',boxShadow:`0 10px 36px ${exercise.color}50`}}>{formFeedback}</div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <div style={{background:'rgba(15,23,42,0.8)',backdropFilter:'blur(20px)',borderRadius:20,padding:22,border:'1px solid rgba(148,163,184,0.12)'}}>
            <h3 style={{fontSize:15,fontWeight:800,margin:'0 0 16px',color:'#f1f5f9'}}>Session Stats</h3>
            {[{i:'T',l:'Duration',v:fmt(duration),c:'#4facfe'},{i:'C',l:'Calories',v:calories,c:'#f97316'},{i:'F',l:'Form',v:`${formQuality}%`,c:'#22c55e'},{i:'R',l:'Reps',v:reps,c:exercise.color}].map(s=>(
              <div key={s.l} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14,paddingBottom:14,borderBottom:'1px solid rgba(148,163,184,0.08)'}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}><span style={{fontSize:16}}>{s.i}</span><span style={{fontSize:12,color:'#94a3b8',fontWeight:600}}>{s.l}</span></div>
                <span style={{fontSize:22,fontWeight:900,color:s.c}}>{s.v}</span>
              </div>
            ))}
            <button
              onClick={async () => {
                try {
                  await API.post("/progress/workout", {
                    exercise: exercise.name,
                    reps,
                    durationMinutes: Math.round(duration / 60) || 1,
                    estimatedCalories: calories,
                    formScore: formQuality,
                  });
                  alert("Workout session saved successfully to MongoDB!");
                  onBack();
                } catch (err) {
                  console.error("Error saving session:", err);
                  alert("Failed to save session, returning back.");
                  onBack();
                }
              }}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 12,
                border: 'none',
                background: 'linear-gradient(135deg, #8DC63F, #5A9010)',
                color: 'white',
                fontWeight: 'bold',
                fontSize: 14,
                cursor: 'pointer',
                marginTop: 10,
                boxShadow: '0 4px 12px rgba(141,198,63,0.25)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              💾 Save & Finish Workout
            </button>
          </div>
          <div style={{background:'rgba(15,23,42,0.8)',backdropFilter:'blur(20px)',borderRadius:20,padding:22,border:'1px solid rgba(148,163,184,0.12)'}}>
            <h3 style={{fontSize:15,fontWeight:800,margin:'0 0 14px',color:'#f1f5f9'}}>Form Tips</h3>
            {exercise.keyPoints.map((tip,i)=>(
              <div key={i} style={{display:'flex',gap:8,marginBottom:10,padding:'9px 11px',borderRadius:10,background:'rgba(148,163,184,0.04)',border:'1px solid rgba(148,163,184,0.07)'}}>
                <span style={{color:exercise.color,fontWeight:700,flexShrink:0}}>0{i+1}</span>
                <span style={{fontSize:12,color:'#cbd5e1',lineHeight:1.6}}>{tip}</span>
              </div>
            ))}
          </div>
          <VoiceAssistant workoutContext={{exercise:exercise.name,reps,formScore:formQuality}}/>
        </div>
      </div>
    </div>
  );
};

// --- MAIN ---
const Workout = () => {
  const [sel, setSel] = useState(null);
  if (sel) return <WorkoutSession exercise={sel} onBack={()=>setSel(null)}/>;
  return <ExerciseSelection onSelectExercise={setSel}/>;
};
export default Workout;
