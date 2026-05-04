import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth, UserButton } from "@clerk/clerk-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadarChart, PolarGrid,
  PolarAngleAxis, Radar,
} from "recharts";

/* ── Shared Navbar ── */
const Navbar = ({ scrolled }) => {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 60px", height: 62,
      background: scrolled ? "rgba(247,249,242,0.97)" : "rgba(247,249,242,0.88)",
      backdropFilter: "blur(16px)",
      borderBottom: "1px solid rgba(141,198,63,0.2)",
      transition: "all 0.3s ease",
    }}>
      <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9,
          background: "linear-gradient(135deg, #5A9010, #8DC63F)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 14px rgba(141,198,63,0.35)",
        }}><span style={{ fontSize: 16 }}>💪</span></div>
        <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: "#3A7A10" }}>
          FitIndia<span style={{ color: "#8DC63F" }}>.ai</span>
        </span>
      </Link>
      <nav style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {[
          { label: "Home",      to: "/" },
          { label: "Dashboard", to: "/dashboard" },
          { label: "Workout",   to: "/workout" },
          { label: "Diet",      to: "/diet" },
          { label: "Progress",  to: "/progress" },
        ].map(({ label, to }) => (
          <Link key={label} to={to} style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14, fontWeight: 500,
            color: window.location.pathname === to ? "#1A2B0A" : "#3A5A1A",
            textDecoration: "none", padding: "6px 14px", borderRadius: 8,
            background: window.location.pathname === to ? "rgba(141,198,63,0.15)" : "transparent",
            border: window.location.pathname === to ? "1px solid rgba(141,198,63,0.3)" : "1px solid transparent",
            transition: "all 0.2s",
          }}
            onMouseEnter={e => { if (window.location.pathname !== to) e.currentTarget.style.background = "rgba(141,198,63,0.08)"; }}
            onMouseLeave={e => { if (window.location.pathname !== to) e.currentTarget.style.background = "transparent"; }}
          >{label}</Link>
        ))}
      </nav>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {isSignedIn ? (
          <UserButton afterSignOutUrl="/" />
        ) : (
          <button onClick={() => navigate("/sign-up")} style={{
            padding: "9px 22px", borderRadius: 9,
            background: "#8DC63F", border: "none",
            color: "#1A2B0A", fontFamily: "'Syne', sans-serif",
            fontWeight: 700, fontSize: 14, cursor: "pointer",
            boxShadow: "0 4px 16px rgba(141,198,63,0.3)",
          }}>Get Started</button>
        )}
      </div>
    </header>
  );
};

/* ── Stat Card ── */
const StatCard = ({ icon, label, value, unit, sub, color, delay }) => {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "#fff" : "#F9FAF7",
        border: `1.5px solid ${hov ? color : "#E4EAD8"}`,
        borderRadius: 18, padding: "24px 22px",
        transition: "all 0.3s ease",
        transform: hov ? "translateY(-5px)" : "none",
        boxShadow: hov ? `0 16px 40px ${color}28` : "0 2px 10px rgba(0,0,0,0.04)",
        animation: `fadeUp 0.6s ease ${delay}ms both`,
        cursor: "default", overflow: "hidden", position: "relative",
      }}
    >
      <div style={{
        position: "absolute", top: -20, right: -20,
        width: 80, height: 80, borderRadius: "50%",
        background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`,
        transition: "transform 0.3s",
        transform: hov ? "scale(2)" : "scale(1)",
      }} />
      <div style={{
        width: 46, height: 46, borderRadius: 12,
        background: `${color}15`, border: `1.5px solid ${color}30`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 22, marginBottom: 14,
        transition: "transform 0.3s",
        transform: hov ? "rotate(-8deg) scale(1.1)" : "none",
      }}>{icon}</div>
      <div style={{ fontSize: 11, color: "#8A9A78", letterSpacing: "0.08em", marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>{label}</div>
      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 900, color: "#1A2B0A", lineHeight: 1 }}>
        {value}<span style={{ fontSize: 14, color: "#8A9A78", fontWeight: 600, marginLeft: 3 }}>{unit}</span>
      </div>
      {sub && <div style={{ fontSize: 12, color: color, fontWeight: 600, marginTop: 6, fontFamily: "'DM Sans', sans-serif" }}>{sub}</div>}
    </div>
  );
};

/* ── Quick Action Card ── */
const ActionCard = ({ icon, title, desc, color, to, delay }) => {
  const navigate = useNavigate();
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={() => navigate(to)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "#fff" : "#F9FAF7",
        border: `1.5px solid ${hov ? color : "#E4EAD8"}`,
        borderRadius: 16, padding: "22px 20px",
        cursor: "pointer",
        transition: "all 0.3s ease",
        transform: hov ? "translateY(-4px)" : "none",
        boxShadow: hov ? `0 14px 36px ${color}20` : "0 2px 8px rgba(0,0,0,0.04)",
        animation: `fadeUp 0.6s ease ${delay}ms both`,
        display: "flex", alignItems: "center", gap: 16,
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 13, flexShrink: 0,
        background: `${color}15`, border: `1.5px solid ${color}30`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 22, transition: "transform 0.3s",
        transform: hov ? "scale(1.15) rotate(-5deg)" : "none",
      }}>{icon}</div>
      <div>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, color: "#1A2B0A", marginBottom: 3 }}>{title}</div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#8A9A78" }}>{desc}</div>
      </div>
      <div style={{ marginLeft: "auto", color: color, fontSize: 18, opacity: hov ? 1 : 0.4, transition: "all 0.2s" }}>→</div>
    </div>
  );
};

/* ── Custom Tooltip ── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#fff", border: "1px solid #E4EAD8",
      borderRadius: 10, padding: "10px 14px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
      fontFamily: "'DM Sans', sans-serif", fontSize: 13,
    }}>
      <p style={{ color: "#667755", marginBottom: 4 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color, fontWeight: 700 }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

/* ═══════════ DASHBOARD ═══════════ */
const Dashboard = () => {
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting("Good morning");
    else if (h < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  if (isLoaded && !isSignedIn) {
    return (
      <div style={{ minHeight: "100vh", background: "#F7F9F2", display: "flex", flexDirection: "column" }}>
        <style>{SHARED_STYLES}</style>
        <Navbar scrolled={scrolled} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40 }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🔒</div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: "#1A2B0A", marginBottom: 12 }}>Sign in to access your Dashboard</h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: "#667755", marginBottom: 28 }}>Track your fitness journey with personalized AI insights.</p>
          <button onClick={() => navigate("/sign-in")} style={{
            padding: "13px 32px", borderRadius: 10, background: "#8DC63F",
            border: "none", color: "#1A2B0A", fontFamily: "'Syne', sans-serif",
            fontWeight: 700, fontSize: 15, cursor: "pointer",
            boxShadow: "0 6px 20px rgba(141,198,63,0.35)",
          }}>Sign In Now</button>
        </div>
      </div>
    );
  }

  const caloriesData = [
    { day: "Mon", burned: 320, target: 400 },
    { day: "Tue", burned: 450, target: 400 },
    { day: "Wed", burned: 280, target: 400 },
    { day: "Thu", burned: 510, target: 400 },
    { day: "Fri", burned: 390, target: 400 },
    { day: "Sat", burned: 620, target: 400 },
    { day: "Sun", burned: 180, target: 400 },
  ];

  const macroData = [
    { day: "Mon", protein: 88, carbs: 210, fats: 55 },
    { day: "Tue", protein: 102, carbs: 190, fats: 62 },
    { day: "Wed", protein: 95, carbs: 225, fats: 48 },
    { day: "Thu", protein: 118, carbs: 200, fats: 70 },
    { day: "Fri", protein: 91, carbs: 215, fats: 58 },
    { day: "Sat", protein: 125, carbs: 240, fats: 65 },
    { day: "Sun", protein: 78, carbs: 180, fats: 45 },
  ];

  const radarData = [
    { subject: "Strength", value: 78 },
    { subject: "Cardio", value: 65 },
    { subject: "Flexibility", value: 55 },
    { subject: "Nutrition", value: 82 },
    { subject: "Recovery", value: 70 },
    { subject: "Consistency", value: 88 },
  ];

  const recentWorkouts = [
    { name: "Upper Body Strength", duration: "45 min", calories: 320, date: "Today", icon: "💪" },
    { name: "HIIT Cardio Blast",   duration: "30 min", calories: 410, date: "Yesterday", icon: "🔥" },
    { name: "Yoga & Flexibility",  duration: "40 min", calories: 180, date: "2 days ago", icon: "🧘" },
    { name: "Leg Day Powerhouse",  duration: "55 min", calories: 480, date: "3 days ago", icon: "🦵" },
  ];

  return (
    <div style={{ background: "#F7F9F2", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{SHARED_STYLES}</style>
      <Navbar scrolled={scrolled} />

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 40px 60px" }}>

        {/* ── Header ── */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          marginBottom: 36, animation: "fadeUp 0.6s ease both",
        }}>
          <div>
            <div style={{ fontSize: 13, color: "#8A9A78", marginBottom: 6, letterSpacing: "0.05em" }}>
              {greeting}, Champion! 👋
            </div>
            <h1 style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "clamp(26px, 3vw, 36px)",
              fontWeight: 900, color: "#1A2B0A",
              letterSpacing: "-0.02em", marginBottom: 6,
            }}>Your Fitness Dashboard</h1>
            <p style={{ fontSize: 15, color: "#667755" }}>Track, analyze, and crush your goals every day.</p>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => navigate("/workout")} style={{
              padding: "11px 24px", borderRadius: 10,
              background: "#8DC63F", border: "none",
              color: "#1A2B0A", fontFamily: "'Syne', sans-serif",
              fontWeight: 700, fontSize: 14, cursor: "pointer",
              boxShadow: "0 4px 16px rgba(141,198,63,0.3)",
              transition: "all 0.25s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(141,198,63,0.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(141,198,63,0.3)"; }}
            >+ Start Workout</button>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18, marginBottom: 32 }}>
          <StatCard delay={0}   icon="🔥" label="CALORIES BURNED TODAY" value="432"  unit="kcal" sub="↑ 12% vs yesterday" color="#F97316" />
          <StatCard delay={80}  icon="💪" label="WORKOUTS THIS WEEK"    value="5"    unit="sessions" sub="Goal: 6 sessions" color="#8DC63F" />
          <StatCard delay={160} icon="🥗" label="PROTEIN INTAKE"        value="118"  unit="g" sub="Goal: 130g daily" color="#3B82F6" />
          <StatCard delay={240} icon="⚡" label="ACTIVE STREAK"         value="12"   unit="days" sub="Personal best!" color="#A855F7" />
        </div>

        {/* ── Charts Row ── */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 24 }}>
          {/* Calories Chart */}
          <div style={{
            background: "#fff", borderRadius: 18, padding: "26px 24px",
            border: "1px solid #E8EFD8",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            animation: "fadeUp 0.6s ease 100ms both",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 700, color: "#1A2B0A" }}>Weekly Calories Burned</h3>
                <p style={{ fontSize: 13, color: "#8A9A78", marginTop: 3 }}>vs daily target of 400 kcal</p>
              </div>
              <div style={{
                padding: "5px 12px", borderRadius: 20,
                background: "rgba(141,198,63,0.12)", border: "1px solid rgba(141,198,63,0.3)",
                fontSize: 12, fontWeight: 600, color: "#5A8A20",
              }}>This Week</div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={caloriesData}>
                <defs>
                  <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8DC63F" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#8DC63F" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="targetGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(141,198,63,0.1)" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#8A9A78" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#8A9A78" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="burned" name="Burned" stroke="#8DC63F" strokeWidth={2.5} fill="url(#calGrad)" dot={{ r: 4, fill: "#8DC63F" }} activeDot={{ r: 6 }} />
                <Area type="monotone" dataKey="target" name="Target" stroke="#F97316" strokeWidth={1.5} strokeDasharray="5 5" fill="url(#targetGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Radar Chart */}
          <div style={{
            background: "#fff", borderRadius: 18, padding: "26px 24px",
            border: "1px solid #E8EFD8",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            animation: "fadeUp 0.6s ease 150ms both",
          }}>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 700, color: "#1A2B0A", marginBottom: 4 }}>Performance Score</h3>
            <p style={{ fontSize: 13, color: "#8A9A78", marginBottom: 16 }}>Overall fitness analysis</p>
            <ResponsiveContainer width="100%" height={190}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(141,198,63,0.15)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#8A9A78" }} />
                <Radar name="Score" dataKey="value" stroke="#8DC63F" fill="#8DC63F" fillOpacity={0.25} strokeWidth={2} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Macro Chart ── */}
        <div style={{
          background: "#fff", borderRadius: 18, padding: "26px 24px",
          border: "1px solid #E8EFD8",
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          marginBottom: 24, animation: "fadeUp 0.6s ease 200ms both",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 700, color: "#1A2B0A" }}>Macro Nutrients This Week</h3>
              <p style={{ fontSize: 13, color: "#8A9A78", marginTop: 3 }}>Protein · Carbs · Fats (grams)</p>
            </div>
            <div style={{ display: "flex", gap: 14, fontSize: 12 }}>
              {[{ c: "#8DC63F", l: "Protein" }, { c: "#3B82F6", l: "Carbs" }, { c: "#F97316", l: "Fats" }].map(({ c, l }) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: c }} />
                  <span style={{ color: "#667755" }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={macroData} barSize={10} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(141,198,63,0.1)" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#8A9A78" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#8A9A78" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="protein" name="Protein" fill="#8DC63F" radius={[4, 4, 0, 0]} />
              <Bar dataKey="carbs" name="Carbs" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="fats" name="Fats" fill="#F97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ── Bottom Row ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Recent workouts */}
          <div style={{
            background: "#fff", borderRadius: 18, padding: "26px 24px",
            border: "1px solid #E8EFD8",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            animation: "fadeUp 0.6s ease 250ms both",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 700, color: "#1A2B0A" }}>Recent Workouts</h3>
              <Link to="/workout" style={{ fontSize: 13, color: "#8DC63F", fontWeight: 600, textDecoration: "none" }}>View All →</Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {recentWorkouts.map(({ name, duration, calories, date, icon }) => (
                <div key={name} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 14px", borderRadius: 12,
                  background: "#F9FAF7", border: "1px solid #E8EFD8",
                  transition: "all 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#8DC63F"; e.currentTarget.style.background = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#E8EFD8"; e.currentTarget.style.background = "#F9FAF7"; }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: "rgba(141,198,63,0.12)", border: "1px solid rgba(141,198,63,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18,
                  }}>{icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: "#1A2B0A" }}>{name}</div>
                    <div style={{ fontSize: 12, color: "#8A9A78", marginTop: 2 }}>{duration} · {calories} kcal</div>
                  </div>
                  <div style={{ fontSize: 12, color: "#B0C090" }}>{date}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ animation: "fadeUp 0.6s ease 300ms both" }}>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 700, color: "#1A2B0A", marginBottom: 16 }}>Quick Actions</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <ActionCard icon="🏋️" title="Start Workout"   desc="Begin your AI-powered training session"   color="#8DC63F" to="/workout"  delay={0} />
              <ActionCard icon="🥗" title="Log Your Meal"   desc="Track macros with our smart diet planner"  color="#3B82F6" to="/diet"     delay={60} />
              <ActionCard icon="📊" title="View Progress"   desc="Analyse your weekly performance trends"    color="#A855F7" to="/progress" delay={120} />
              <ActionCard icon="🎯" title="Update Goals"    desc="Adjust targets to match your ambitions"    color="#F97316" to="/diet"     delay={180} />
            </div>
          </div>
        </div>

        {/* ── Motivational Banner ── */}
        <div style={{
          marginTop: 28,
          padding: "28px 36px",
          borderRadius: 20,
          background: "linear-gradient(135deg, #1A2B0A 0%, #2D4A10 50%, #1A3A08 100%)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          animation: "fadeUp 0.6s ease 350ms both",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: -40, right: -40,
            width: 160, height: 160, borderRadius: "50%",
            background: "rgba(141,198,63,0.08)",
          }} />
          <div style={{
            position: "absolute", bottom: -30, left: "40%",
            width: 100, height: 100, borderRadius: "50%",
            background: "rgba(141,198,63,0.05)",
          }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: 13, color: "#A8D870", letterSpacing: "0.1em", marginBottom: 6 }}>🏆 DAILY MOTIVATION</div>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: "#E8F5C8", marginBottom: 6 }}>
              "The only bad workout is the one that didn't happen."
            </h3>
            <p style={{ fontSize: 14, color: "rgba(200,230,150,0.65)" }}>Keep pushing — you're 12 days into your streak! 🔥</p>
          </div>
          <button onClick={() => navigate("/workout")} style={{
            padding: "12px 28px", borderRadius: 10,
            background: "#8DC63F", border: "none",
            color: "#1A2B0A", fontFamily: "'Syne', sans-serif",
            fontWeight: 700, fontSize: 14, cursor: "pointer",
            flexShrink: 0, position: "relative", zIndex: 1,
            boxShadow: "0 4px 16px rgba(141,198,63,0.4)",
            transition: "all 0.25s",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}
          >Train Now →</button>
        </div>
      </main>
    </div>
  );
};

const SHARED_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800;900&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: #F7F9F2; margin: 0; padding: 0; }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes pulse {
    0%,100% { opacity: 1; } 50% { opacity: 0.6; }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: #F7F9F2; }
  ::-webkit-scrollbar-thumb { background: #8DC63F; border-radius: 3px; }
`;

export default Dashboard;