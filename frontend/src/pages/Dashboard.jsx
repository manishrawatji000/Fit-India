// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import API from "../api.js";

/* ── Animated counter ── */
const Counter = ({ end, suffix = "", duration = 1600 }) => {
  const [n, setN] = useState(0);
  const ref = useRef(null);
  const done = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !done.current) {
        done.current = true;
        let v = 0;
        const step = end / (duration / 16);
        const t = setInterval(() => {
          v += step;
          if (v >= end) { setN(end); clearInterval(t); }
          else setN(Math.floor(v));
        }, 16);
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end, duration]);
  return <span ref={ref}>{n.toLocaleString()}{suffix}</span>;
};

/* ── Circular Ring ── */
const Ring = ({ percent, color, size = 90, stroke = 9, label, value }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (percent / 100) * circ;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: "stroke-dasharray 1.5s ease" }} />
      </svg>
      <div style={{ textAlign: "center", marginTop: -4 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#f1f5f9" }}>{value}</div>
        <div style={{ fontSize: 10, color: "#64748b", fontWeight: 600, letterSpacing: "0.06em" }}>{label}</div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [time, setTime] = useState(new Date());
  const [hovCard, setHovCard] = useState(null);
  
  const [metrics, setMetrics] = useState(null);
  const [workoutStats, setWorkoutStats] = useState({ workouts: [], meals: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const loadDashboardData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const [metricsRes, progressRes] = await Promise.all([
          API.get("/diet/metrics").catch(() => ({ data: null })),
          API.get("/progress/summary").catch(() => ({ data: { workouts: [], meals: [] } }))
        ]);
        if (metricsRes?.data) {
          setMetrics(metricsRes.data);
        }
        if (progressRes?.data) {
          setWorkoutStats(progressRes.data);
        }
      } catch (err) {
        console.error("Dashboard load error:", err);
        if (err.response && err.response.status === 401) {
          localStorage.removeItem("token");
        }
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();

    const handleSync = () => {
      setLoading(true);
      loadDashboardData();
    };

    window.addEventListener("user-synced", handleSync);
    return () => window.removeEventListener("user-synced", handleSync);
  }, []);

  const greeting = () => {
    const h = time.getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // Dynamic Calculations based on MongoDB data
  const weight = metrics?.weightKg || 68;
  const goalType = metrics?.goal || "maintain";
  
  let caloriesTarget = 2200;
  if (metrics) {
    if (goalType === "gain") caloriesTarget = Math.round(weight * 33 + 400);
    else if (goalType === "lose") caloriesTarget = Math.round(weight * 24);
    else caloriesTarget = Math.round(weight * 30);
  }
  
  const proteinTarget = metrics ? Math.round(weight * 1.8) : 120;
  
  // Sum today's workouts and meals
  const todayStr = new Date().toLocaleDateString();
  
  const todayWorkouts = (workoutStats?.workouts || []).filter(w => 
    new Date(w.date).toLocaleDateString() === todayStr
  );
  const todayMeals = (workoutStats?.meals || []).filter(m => 
    new Date(m.date).toLocaleDateString() === todayStr
  );
  
  const caloriesBurnedToday = todayWorkouts.reduce((sum, w) => sum + (w.estimatedCalories || 0), 0);
  const proteinLoggedToday = todayMeals.reduce((sum, m) => sum + (m.protein || 0), 0);
  const activeMinutesToday = todayWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
  
  const calPct = Math.min(100, caloriesTarget > 0 ? Math.round((caloriesBurnedToday / caloriesTarget) * 100) : 0);
  const wrkPct = Math.min(100, Math.round((activeMinutesToday / 45) * 100));
  const proPct = Math.min(100, proteinTarget > 0 ? Math.round((proteinLoggedToday / proteinTarget) * 100) : 0);
  
  const stats = [
    { id: "cal",   icon: "🔥", label: "Calories Burned Today",  value: caloriesBurnedToday, target: caloriesTarget, unit: "kcal", color: "#f97316", sub: `Target: ${caloriesTarget} kcal`, gradient: "linear-gradient(135deg,#f97316,#fbbf24)", pct: calPct || 0 },
    { id: "wrk",   icon: "⚡", label: "Active Workout Time",      value: activeMinutesToday,   target: 45,             unit: "min",  color: "#22d3ee", sub: "Goal: 45 min daily",           gradient: "linear-gradient(135deg,#22d3ee,#3b82f6)", pct: wrkPct || 0 },
    { id: "pro",   icon: "💪", label: "Protein Logged Today",   value: proteinLoggedToday,  target: proteinTarget,  unit: "g",    color: "#22c55e", sub: `Goal: ${proteinTarget}g daily`,     gradient: "linear-gradient(135deg,#22c55e,#10b981)", pct: proPct || 0 },
    { id: "h2o",   icon: "💧", label: "Daily Water Goal",     value: metrics ? 2.5 : 1.8,  target: metrics ? 2.5 : 1.8,  unit: "L",    color: "#818cf8", sub: "Stay hydrated all day",          gradient: "linear-gradient(135deg,#818cf8,#6366f1)", pct: metrics ? 100 : 60 },
  ];

  const quickActions = [
    { label: "Start Workout",  icon: "🏋️", path: "/workout",  gradient: "linear-gradient(135deg, #f97316, #ef4444)" },
    { label: "Diet Plan",      icon: "🥗", path: "/diet",     gradient: "linear-gradient(135deg, #22d3ee, #3b82f6)" },
    { label: "View Progress",  icon: "📊", path: "/progress", gradient: "linear-gradient(135deg, #a78bfa, #ec4899)" },
  ];

  // Calculate weekly activity from real workouts
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const last7Days = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - idx));
    return d;
  });
  
  const recentActivity = last7Days.map(date => {
    const dateStr = date.toLocaleDateString();
    const workoutsOnDay = (workoutStats?.workouts || []).filter(w => 
      new Date(w.date).toLocaleDateString() === dateStr
    );
    const kcalBurned = workoutsOnDay.reduce((sum, w) => sum + (w.estimatedCalories || 0), 0);
    return {
      day: daysOfWeek[date.getDay()],
      done: workoutsOnDay.length > 0,
      type: workoutsOnDay.length > 0 ? workoutsOnDay[0].exercise : "Rest Day",
      kcal: kcalBurned,
      icon: workoutsOnDay.length > 0 ? "🏋️" : "🛌"
    };
  });
  
  const completedWorkoutDaysCount = recentActivity.filter(d => d.done).length;

  const firstName = user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] || "Athlete";

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #020617 0%, #0f172a 50%, #0a0f1e 100%)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        fontFamily: "'DM Sans', sans-serif", color: "#f1f5f9"
      }}>
        <div style={{
          width: 50, height: 50, borderRadius: "50%",
          border: "4px solid rgba(249,115,22,0.1)",
          borderTopColor: "#f97316",
          animation: "spin 1s linear infinite",
          marginBottom: 16
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#94a3b8" }}>Loading your fitness dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #020617 0%, #0f172a 50%, #0a0f1e 100%)",
      padding: "32px 36px 48px",
      fontFamily: "'DM Sans', system-ui, sans-serif",
      color: "#f1f5f9",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700;9..40,800&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes pulseGlow { 0%,100%{box-shadow:0 0 0 0 rgba(249,115,22,0.35)} 50%{box-shadow:0 0 0 10px rgba(249,115,22,0)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes growBar { from{width:0} to{width:var(--w)} }
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#334155;border-radius:4px}
      `}</style>

      {/* ── Hero Greeting ── */}
      <div style={{ marginBottom: 36, animation: "fadeUp 0.7s ease both" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "5px 14px", borderRadius: 999,
              background: "rgba(249,115,22,0.1)",
              border: "1px solid rgba(249,115,22,0.25)",
              fontSize: 11, fontWeight: 700, color: "#fb923c",
              letterSpacing: "0.1em", marginBottom: 12,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fb923c", display: "inline-block", boxShadow: "0 0 8px #fb923c" }} />
              LIVE DASHBOARD
            </div>
            <h1 style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "clamp(28px, 4vw, 42px)",
              fontWeight: 900, margin: 0, lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}>
              {greeting()},{" "}
              <span style={{
                background: "linear-gradient(135deg, #f97316 0%, #fb923c 50%, #fbbf24 100%)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                animation: "shimmer 3s linear infinite",
              }}>{firstName} 🔥</span>
            </h1>
            <p style={{ fontSize: 14, color: "#64748b", margin: "8px 0 0", fontWeight: 500 }}>
              {time.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
              {" · "}{time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>

          {/* Streak Badge */}
          <div style={{
            background: "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(251,146,60,0.08))",
            border: "1px solid rgba(249,115,22,0.25)",
            borderRadius: 20, padding: "16px 24px",
            textAlign: "center", animation: "pulseGlow 3s ease-in-out infinite",
          }}>
            <div style={{ fontSize: 32 }}>🔥</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#fb923c", lineHeight: 1 }}>7</div>
            <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, letterSpacing: "0.06em" }}>DAY STREAK</div>
          </div>
        </div>
      </div>

      {/* ── Stat Cards Grid ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: 20, marginBottom: 28,
      }}>
        {stats.map((s, i) => (
          <div key={s.id}
            onMouseEnter={() => setHovCard(s.id)}
            onMouseLeave={() => setHovCard(null)}
            style={{
              background: hovCard === s.id
                ? `linear-gradient(145deg, rgba(15,23,42,0.95), rgba(15,23,42,0.9))`
                : "rgba(15,23,42,0.7)",
              backdropFilter: "blur(20px)",
              borderRadius: 24, padding: "24px 22px",
              border: `1px solid ${hovCard === s.id ? s.color + "40" : "rgba(148,163,184,0.1)"}`,
              boxShadow: hovCard === s.id ? `0 16px 48px ${s.color}20` : "0 4px 20px rgba(0,0,0,0.3)",
              transition: "all 0.3s ease",
              transform: hovCard === s.id ? "translateY(-6px)" : "none",
              animation: `fadeUp 0.6s ease ${i * 0.1}s both`,
              position: "relative", overflow: "hidden", cursor: "default",
            }}>
            {/* Bg glow */}
            <div style={{
              position: "absolute", top: -30, right: -30,
              width: 110, height: 110, borderRadius: "50%",
              background: `radial-gradient(circle, ${s.color}18, transparent)`,
              pointerEvents: "none",
            }} />

            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: s.gradient,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, boxShadow: `0 8px 24px ${s.color}40`,
                transition: "transform 0.3s",
                transform: hovCard === s.id ? "scale(1.1) rotate(-5deg)" : "none",
              }}>{s.icon}</div>
              <div style={{
                fontSize: 11, fontWeight: 700, color: s.color,
                background: `${s.color}12`, padding: "4px 10px",
                borderRadius: 99, border: `1px solid ${s.color}25`,
              }}>{s.pct}%</div>
            </div>

            <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 34, fontWeight: 900, color: s.color, lineHeight: 1, marginBottom: 4 }}>
              <Counter end={typeof s.value === "string" ? parseFloat(s.value) : s.value} />{s.unit}
            </div>
            <div style={{ fontSize: 12, color: "#475569", fontWeight: 500 }}>{s.sub}</div>

            {/* Progress bar */}
            <div style={{ marginTop: 14, height: 4, background: "rgba(148,163,184,0.1)", borderRadius: 99, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 99,
                background: s.gradient,
                width: `${s.pct}%`,
                transition: "width 1.4s ease",
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Middle Row: Activity Rings + Recent Activity ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 28 }}>

        {/* Today's Rings */}
        <div style={{
          background: "rgba(15,23,42,0.7)", backdropFilter: "blur(20px)",
          borderRadius: 24, padding: "28px 24px",
          border: "1px solid rgba(148,163,184,0.1)",
          animation: "fadeUp 0.7s ease 0.2s both",
        }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#e2e8f0", marginBottom: 4 }}>Today's Rings</div>
          <div style={{ fontSize: 12, color: "#475569", marginBottom: 24 }}>Move · Exercise · Stand</div>
          <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center" }}>
            <Ring percent={calPct} color="#f97316" label="MOVE" value={`${caloriesBurnedToday} kcal`} />
            <Ring percent={wrkPct} color="#22d3ee" label="EXERCISE" value={`${activeMinutesToday} min`} />
            <Ring percent={proPct} color="#22c55e" label="PROTEIN" value={`${proteinLoggedToday} g`} />
          </div>
        </div>

        {/* Weekly Activity */}
        <div style={{
          background: "rgba(15,23,42,0.7)", backdropFilter: "blur(20px)",
          borderRadius: 24, padding: "28px 24px",
          border: "1px solid rgba(148,163,184,0.1)",
          animation: "fadeUp 0.7s ease 0.3s both",
        }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#e2e8f0", marginBottom: 4 }}>Weekly Activity</div>
          <div style={{ fontSize: 12, color: "#475569", marginBottom: 20 }}>This week's workout days</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80 }}>
            {recentActivity.map((d, i) => (
              <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{
                  width: "100%", borderRadius: 6,
                  background: d.done
                    ? "linear-gradient(to top, #f97316, #fb923c)"
                    : "rgba(148,163,184,0.1)",
                  height: d.done ? `${Math.max(20, (d.kcal / 320) * 70)}px` : "12px",
                  transition: `height 0.8s ease ${i * 0.08}s`,
                  boxShadow: d.done ? "0 4px 12px rgba(249,115,22,0.3)" : "none",
                }} />
                <div style={{ fontSize: 9, color: "#475569", fontWeight: 600 }}>{d.day}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, fontSize: 12, color: "#64748b" }}>
            <span style={{ color: "#fb923c", fontWeight: 800 }}>{completedWorkoutDaysCount} of 7</span> workout days completed
          </div>
        </div>

        {/* Quick Macros */}
        <div style={{
          background: "rgba(15,23,42,0.7)", backdropFilter: "blur(20px)",
          borderRadius: 24, padding: "28px 24px",
          border: "1px solid rgba(148,163,184,0.1)",
          animation: "fadeUp 0.7s ease 0.4s both",
        }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#e2e8f0", marginBottom: 4 }}>Macro Tracker</div>
          <div style={{ fontSize: 12, color: "#475569", marginBottom: 20 }}>Today's nutrition snapshot</div>
          {[
            { label: "Protein", done: proteinLoggedToday, total: proteinTarget, color: "#22c55e", unit: "g" },
            { label: "Carbs",   done: Math.round(proteinLoggedToday * 1.5), total: Math.round(caloriesTarget * 0.5 / 4), color: "#3b82f6", unit: "g" },
            { label: "Fats",    done: Math.round(proteinLoggedToday * 0.4), total: Math.round(caloriesTarget * 0.25 / 9), color: "#a855f7", unit: "g" },
          ].map((m) => (
            <div key={m.label} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8" }}>{m.label}</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: m.color }}>{m.done}{m.unit}<span style={{ color: "#475569", fontWeight: 500 }}>/{m.total}{m.unit}</span></span>
              </div>
              <div style={{ height: 6, background: "rgba(148,163,184,0.1)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 99,
                  background: m.color,
                  width: `${(m.done / m.total) * 100}%`,
                  transition: "width 1.2s ease",
                  boxShadow: `0 0 8px ${m.color}60`,
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 28 }}>
        {quickActions.map((a, i) => (
          <button key={a.label}
            onClick={() => navigate(a.path)}
            style={{
              background: a.gradient,
              border: "none", borderRadius: 20,
              padding: "22px 24px",
              display: "flex", alignItems: "center", gap: 14,
              cursor: "pointer",
              color: "white",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 16, fontWeight: 800,
              transition: "all 0.28s ease",
              boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
              animation: `fadeUp 0.6s ease ${0.5 + i * 0.1}s both`,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,0,0,0.35)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.25)";
            }}
          >
            <span style={{ fontSize: 28 }}>{a.icon}</span>
            <span>{a.label}</span>
            <span style={{ marginLeft: "auto", fontSize: 20, opacity: 0.7 }}>→</span>
          </button>
        ))}
      </div>

      {/* ── AI Coach Card + Tips Row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>

        {/* AI Coach Quick Access */}
        <div style={{
          background: "linear-gradient(135deg, rgba(66,133,244,0.12), rgba(52,168,83,0.08))",
          backdropFilter: "blur(20px)",
          borderRadius: 24, padding: "32px 28px",
          border: "1px solid rgba(66,133,244,0.2)",
          animation: "fadeUp 0.7s ease 0.6s both",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position:"absolute", top:"-20%", right:"-10%", width:"50%", height:"150%",
            background:"radial-gradient(ellipse, rgba(66,133,244,0.15) 0%, transparent 65%)",
            pointerEvents:"none" }} />

          <div style={{ position:"relative", zIndex:2 }}>
            <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:16 }}>
              <div style={{
                width:56, height:56, borderRadius:"50%",
                background:"linear-gradient(135deg, #4285f4, #34a853)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:26, boxShadow:"0 8px 24px rgba(66,133,244,0.4)",
                flexShrink:0,
              }}>🤖</div>
              <div>
                <div style={{ fontSize:18, fontWeight:800, color:"#f1f5f9" }}>FitAI Coach</div>
                <div style={{
                  display:"inline-flex", alignItems:"center", gap:5, marginTop:4,
                  padding:"2px 10px", borderRadius:99,
                  background:"rgba(66,133,244,0.15)", border:"1px solid rgba(66,133,244,0.3)",
                  fontSize:10, fontWeight:700, color:"#60a5fa", letterSpacing:"0.06em",
                }}>
                  GEMINI 2.5 FLASH
                </div>
              </div>
            </div>

            <p style={{ fontSize:14, color:"#64748b", lineHeight:1.7, marginBottom:20 }}>
              Your AI coach now has its own dedicated space. Ask about workouts, nutrition,
              form corrections, recovery — with full conversation memory.
            </p>

            <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:24 }}>
              {["🏋️ Workout Tips", "🥗 Nutrition", "🎤 Voice Input", "💬 Memory"].map(tag => (
                <span key={tag} style={{
                  padding:"5px 12px", borderRadius:99, fontSize:11, fontWeight:600,
                  background:"rgba(66,133,244,0.1)", border:"1px solid rgba(66,133,244,0.2)",
                  color:"#93c5fd",
                }}>{tag}</span>
              ))}
            </div>
          </div>

          <button
            onClick={() => navigate("/ai-coach")}
            style={{
              width:"100%", padding:"14px 20px", borderRadius:14, border:"none",
              background:"linear-gradient(135deg, #4285f4, #34a853)",
              color:"white", fontSize:15, fontWeight:800,
              cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              boxShadow:"0 8px 28px rgba(66,133,244,0.4)",
              transition:"all 0.25s ease",
              position:"relative", zIndex:2,
            }}
            onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 14px 36px rgba(66,133,244,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 8px 28px rgba(66,133,244,0.4)"; }}
          >
            🤖 Open AI Coach →
          </button>
        </div>

        {/* Today's Tips */}
        <div style={{
          background: "rgba(15,23,42,0.7)", backdropFilter: "blur(20px)",
          borderRadius: 24, padding: "28px 24px",
          border: "1px solid rgba(148,163,184,0.1)",
          animation: "fadeUp 0.7s ease 0.7s both",
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10, marginBottom: 20,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, #a78bfa, #ec4899)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18,
            }}>💡</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#e2e8f0" }}>What To Do Next</div>
          </div>
          {[
            { icon: "🏋️", text: "Start a live session in Workout for AI form feedback", color: "#f97316" },
            { icon: "🎙️", text: "Ask your voice coach about exercise or nutrition tips", color: "#22d3ee" },
            { icon: "🥗", text: "Generate your personalized diet in the Diet tab", color: "#22c55e" },
            { icon: "📊", text: "Check animated charts to see weekly progress trends", color: "#a78bfa" },
          ].map((tip, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: 12,
              padding: "10px 12px", borderRadius: 12,
              background: "rgba(148,163,184,0.04)",
              border: "1px solid rgba(148,163,184,0.07)",
              marginBottom: 10,
              transition: "all 0.2s",
              cursor: "default",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(148,163,184,0.09)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(148,163,184,0.04)"}
            >
              <span style={{ fontSize: 16, marginTop: 1 }}>{tip.icon}</span>
              <span style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>{tip.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;