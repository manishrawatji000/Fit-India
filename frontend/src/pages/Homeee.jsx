import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth, UserButton } from "@clerk/clerk-react";

/* ─── Animated Counter ─────────────────────────────────────────────────────── */
const Counter = ({ end, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const inc = end / 60;
        const timer = setInterval(() => {
          start += inc;
          if (start >= end) { setCount(end); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 20);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);
  return <span ref={ref}>{count}{suffix}</span>;
};

/* ─── Floating Particle ────────────────────────────────────────────────────── */
const Particle = ({ style }) => (
  <div style={{
    position: "absolute",
    width: 3,
    height: 3,
    borderRadius: "50%",
    background: "rgba(185, 28, 28, 0.6)",
    animation: "floatParticle 8s ease-in-out infinite",
    ...style
  }} />
);

/* ─── Feature Card ──────────────────────────────────────────────────────────── */
const FeatureCard = ({ icon, title, desc, accent, delay }) => {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: "relative",
        padding: "32px 28px",
        background: hov
          ? "linear-gradient(135deg, rgba(185,28,28,0.12) 0%, rgba(10,10,10,0.9) 100%)"
          : "rgba(10,10,10,0.7)",
        border: `1px solid ${hov ? "rgba(185,28,28,0.5)" : "rgba(60,60,60,0.6)"}`,
        borderRadius: 20,
        backdropFilter: "blur(20px)",
        cursor: "default",
        transition: "all 0.4s cubic-bezier(0.23, 1, 0.32, 1)",
        transform: hov ? "translateY(-8px)" : "translateY(0)",
        boxShadow: hov ? "0 30px 60px rgba(185,28,28,0.2), 0 0 0 1px rgba(185,28,28,0.1)" : "0 4px 20px rgba(0,0,0,0.5)",
        animationDelay: `${delay}ms`,
        animation: "fadeSlideUp 0.8s ease both",
        overflow: "hidden",
      }}
    >
      <div style={{
        position: "absolute",
        top: 0, right: 0,
        width: 120, height: 120,
        background: `radial-gradient(circle at 100% 0%, ${accent}15 0%, transparent 70%)`,
        borderRadius: "0 20px 0 0",
      }} />
      <div style={{
        width: 52, height: 52,
        borderRadius: 14,
        background: `linear-gradient(135deg, ${accent}25, ${accent}10)`,
        border: `1px solid ${accent}40`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 24, marginBottom: 20,
        transition: "transform 0.3s ease",
        transform: hov ? "scale(1.1) rotate(-5deg)" : "scale(1) rotate(0deg)",
      }}>
        {icon}
      </div>
      <h3 style={{
        fontSize: 18, fontWeight: 700,
        color: "#f0f0f0",
        marginBottom: 10, letterSpacing: "-0.01em",
        fontFamily: "'Bebas Neue', 'Barlow Condensed', Impact, sans-serif",
        fontSize: 22, letterSpacing: "0.04em",
      }}>{title}</h3>
      <p style={{ fontSize: 14, color: "#888", lineHeight: 1.7 }}>{desc}</p>
    </div>
  );
};

/* ─── User Program Card ─────────────────────────────────────────────────────── */
const ProgramCard = ({ name, level, goal, muscles, delay }) => {
  const [hov, setHov] = useState(false);
  const initials = name.slice(0, 1).toUpperCase();
  const colors = { Beginner: "#22c55e", Intermediate: "#f59e0b", Advanced: "#ef4444" };
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "rgba(185,28,28,0.08)" : "rgba(12,12,12,0.8)",
        border: `1px solid ${hov ? "rgba(185,28,28,0.4)" : "rgba(40,40,40,0.8)"}`,
        borderRadius: 16,
        padding: "24px",
        transition: "all 0.35s ease",
        transform: hov ? "scale(1.02)" : "scale(1)",
        cursor: "default",
        animation: `fadeSlideUp 0.8s ease ${delay}ms both`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
        <div style={{
          width: 46, height: 46, borderRadius: "50%",
          background: "linear-gradient(135deg, #7f1d1d, #b91c1c)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, fontWeight: 800, color: "#fff",
          fontFamily: "'Bebas Neue', Impact, sans-serif",
          letterSpacing: "0.05em",
          border: "2px solid rgba(185,28,28,0.4)",
        }}>{initials}</div>
        <div>
          <div style={{ fontWeight: 700, color: "#f0f0f0", fontSize: 15 }}>{name}<span style={{ color: "#b91c1c" }}>.exe</span></div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 5, marginTop: 2,
            padding: "2px 8px", borderRadius: 20,
            background: `${colors[level]}15`,
            border: `1px solid ${colors[level]}30`,
            fontSize: 11, fontWeight: 600, color: colors[level],
          }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: colors[level], display: "inline-block" }} />
            {level}
          </div>
        </div>
      </div>
      <div style={{ fontSize: 13, color: "#666", marginBottom: 6 }}>🎯 Goal</div>
      <div style={{ fontSize: 15, color: "#ddd", fontWeight: 600, marginBottom: 14 }}>{goal}</div>
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 6,
      }}>
        {muscles.map(m => (
          <span key={m} style={{
            padding: "4px 10px", borderRadius: 20,
            background: "rgba(185,28,28,0.1)",
            border: "1px solid rgba(185,28,28,0.2)",
            fontSize: 11, color: "#cc4444",
          }}>{m}</span>
        ))}
      </div>
    </div>
  );
};

/* ─── Metric Box ────────────────────────────────────────────────────────────── */
const MetricBox = ({ label, value, color }) => (
  <div style={{
    flex: 1, padding: "14px 16px",
    background: "rgba(15,15,15,0.8)",
    border: `1px solid ${color}20`,
    borderRadius: 12,
    textAlign: "center",
  }}>
    <div style={{ fontSize: 22, fontWeight: 900, color, fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: "0.05em" }}>{value}</div>
    <div style={{ fontSize: 10, color: "#555", marginTop: 2, letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</div>
  </div>
);

/* ─── Main Home Component ───────────────────────────────────────────────────── */
const Home = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const [scrollY, setScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toApp = () => navigate(isSignedIn ? "/dashboard" : "/sign-up");
  const toTrain = () => navigate(isSignedIn ? "/workout" : "/sign-up");

  return (
    <div style={{
      minHeight: "100vh",
      background: "#050505",
      color: "#f0f0f0",
      fontFamily: "'DM Sans', 'Outfit', system-ui, sans-serif",
      overflowX: "hidden",
    }}>

      {/* ── GLOBAL STYLES ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&family=Barlow+Condensed:wght@600;700;800;900&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(-30px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes floatParticle {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.6; }
          33%  { transform: translateY(-40px) translateX(20px); opacity: 0.3; }
          66%  { transform: translateY(-20px) translateX(-15px); opacity: 0.8; }
        }
        @keyframes scanLine {
          0% { top: -2px; }
          100% { top: 100%; }
        }
        @keyframes pulseRed {
          0%, 100% { box-shadow: 0 0 0 0 rgba(185,28,28,0.4); }
          50%  { box-shadow: 0 0 0 12px rgba(185,28,28,0); }
        }
        @keyframes rotateSlow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes barGrow {
          from { width: 0; }
          to   { width: 100%; }
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        @keyframes borderPulse {
          0%, 100% { border-color: rgba(185,28,28,0.3); }
          50% { border-color: rgba(185,28,28,0.8); }
        }
        @keyframes glitchText {
          0%, 90%, 100% { text-shadow: none; }
          92% { text-shadow: 3px 0 rgba(185,28,28,0.8), -3px 0 rgba(0,100,255,0.5); }
          94% { text-shadow: -2px 0 rgba(185,28,28,0.8), 2px 0 rgba(0,200,100,0.5); }
        }
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .glow-btn {
          position: relative;
          overflow: hidden;
        }
        .glow-btn::before {
          content: '';
          position: absolute;
          top: 50%; left: -100%;
          width: 80%; height: 200%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
          transform: translateY(-50%) skewX(-20deg);
          transition: left 0.6s ease;
        }
        .glow-btn:hover::before { left: 150%; }

        .nav-link-item {
          color: #888;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.05em;
          transition: color 0.2s;
          position: relative;
        }
        .nav-link-item::after {
          content: '';
          position: absolute;
          bottom: -4px; left: 0;
          width: 0; height: 1px;
          background: #b91c1c;
          transition: width 0.3s ease;
        }
        .nav-link-item:hover { color: #f0f0f0; }
        .nav-link-item:hover::after { width: 100%; }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #050505; }
        ::-webkit-scrollbar-thumb { background: #b91c1c; border-radius: 2px; }
      `}</style>

      {/* ── TICKER TAPE ── */}
      <div style={{
        background: "#b91c1c",
        padding: "6px 0",
        overflow: "hidden",
        position: "relative",
        zIndex: 100,
      }}>
        <div style={{
          display: "flex",
          gap: 0,
          animation: "ticker 25s linear infinite",
          whiteSpace: "nowrap",
          width: "max-content",
        }}>
          {Array(2).fill(null).map((_, i) => (
            <div key={i} style={{ display: "flex", gap: 48, paddingRight: 48 }}>
              {["🔥 AI POSE DETECTION", "💪 REAL-TIME REP COUNTING", "🥗 PERSONALIZED DIET PLANS", "⚡ VOICE-POWERED COACHING", "🏋️ 8 EXERCISES TRACKED", "📊 LIVE FORM SCORING"].map(t => (
                <span key={t} style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", color: "rgba(255,255,255,0.9)" }}>{t}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── NAVBAR ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 48px",
        background: scrollY > 50 ? "rgba(5,5,5,0.97)" : "rgba(5,5,5,0.85)",
        backdropFilter: "blur(24px)",
        borderBottom: `1px solid ${scrollY > 50 ? "rgba(185,28,28,0.3)" : "rgba(40,40,40,0.5)"}`,
        transition: "all 0.3s ease",
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 38, height: 38,
            background: "linear-gradient(135deg, #7f1d1d, #b91c1c)",
            borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 900,
            color: "#fff",
            boxShadow: "0 0 20px rgba(185,28,28,0.4)",
            animation: "pulseRed 3s ease-in-out infinite",
          }}>F</div>
          <div>
            <div style={{
              fontFamily: "'Bebas Neue', Impact, sans-serif",
              fontSize: 22, letterSpacing: "0.1em",
              color: "#f0f0f0",
              lineHeight: 1,
            }}>
              FIT INDIA<span style={{ color: "#b91c1c" }}>.</span>AI
            </div>
            <div style={{ fontSize: 9, color: "#444", letterSpacing: "0.2em", textTransform: "uppercase" }}>Advanced AI Fitness</div>
          </div>
        </Link>

        {/* Nav */}
        <nav style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {["Home", "Features", "Programs", "Dashboard"].map(item => (
            <a key={item} href={item === "Dashboard" ? (isSignedIn ? "/dashboard" : "/sign-in") : "#"} className="nav-link-item">{item}</a>
          ))}
        </nav>

        {/* CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {isSignedIn ? (
            <>
              <button onClick={() => navigate("/dashboard")} className="glow-btn" style={{
                padding: "9px 22px", borderRadius: 8,
                background: "linear-gradient(135deg, #7f1d1d, #b91c1c)",
                border: "none", color: "#fff",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                letterSpacing: "0.05em",
              }}>Dashboard</button>
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <>
              <Link to="/sign-in" style={{
                padding: "9px 18px", borderRadius: 8,
                border: "1px solid rgba(80,80,80,0.5)",
                background: "transparent", color: "#888",
                fontSize: 13, fontWeight: 500,
                textDecoration: "none",
                transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.target.style.color = "#f0f0f0"; e.target.style.borderColor = "rgba(185,28,28,0.5)"; }}
                onMouseLeave={e => { e.target.style.color = "#888"; e.target.style.borderColor = "rgba(80,80,80,0.5)"; }}
              >Sign In</Link>
              <button onClick={toApp} className="glow-btn" style={{
                padding: "9px 22px", borderRadius: 8,
                background: "linear-gradient(135deg, #7f1d1d, #b91c1c)",
                border: "none", color: "#fff",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                letterSpacing: "0.05em",
                boxShadow: "0 4px 20px rgba(185,28,28,0.35)",
                transition: "all 0.2s",
              }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 28px rgba(185,28,28,0.55)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(185,28,28,0.35)"}
              >Get Started →</button>
            </>
          )}
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════════════════════ */}
      <section style={{
        position: "relative",
        minHeight: "92vh",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        padding: "80px 48px 80px",
      }}>
        {/* Background grid */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `
            linear-gradient(rgba(185,28,28,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(185,28,28,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
          pointerEvents: "none",
        }} />

        {/* Red gradient blob top-right */}
        <div style={{
          position: "absolute", top: "-20%", right: "-10%",
          width: 700, height: 700, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(185,28,28,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
          animation: "breathe 6s ease-in-out infinite",
        }} />

        {/* Bottom-left blob */}
        <div style={{
          position: "absolute", bottom: "-20%", left: "-10%",
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(185,28,28,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Floating particles */}
        {[
          { top: "20%", left: "15%", animationDelay: "0s" },
          { top: "40%", left: "8%",  animationDelay: "2s" },
          { top: "60%", left: "25%", animationDelay: "4s" },
          { top: "15%", left: "55%", animationDelay: "1s" },
          { top: "75%", left: "70%", animationDelay: "3s" },
          { top: "30%", left: "80%", animationDelay: "5s" },
        ].map((p, i) => <Particle key={i} style={p} />)}

        {/* Left Content */}
        <div style={{
          flex: 1, maxWidth: 640,
          position: "relative", zIndex: 2,
        }}>
          {/* Status pill */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 16px",
            background: "rgba(185,28,28,0.1)",
            border: "1px solid rgba(185,28,28,0.25)",
            borderRadius: 100, marginBottom: 28,
            animation: "fadeSlideUp 0.6s ease both",
            animationDelay: "0.1s",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block", animation: "pulseRed 2s infinite" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#cc4444", letterSpacing: "0.1em" }}>AI TRAINER · LIVE</span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: "'Bebas Neue', 'Barlow Condensed', Impact, sans-serif",
            fontSize: "clamp(62px, 8vw, 110px)",
            fontWeight: 900,
            lineHeight: 0.92,
            letterSpacing: "-0.01em",
            marginBottom: 24,
            animation: "fadeSlideUp 0.7s ease 0.15s both",
          }}>
            <span style={{
              display: "block",
              color: "#f0f0f0",
              animation: "glitchText 8s ease-in-out infinite",
            }}>TRANSFORM</span>
            <span style={{
              display: "block",
              background: "linear-gradient(135deg, #b91c1c 0%, #ef4444 50%, #b91c1c 100%)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>YOUR</span>
            <span style={{ display: "block", color: "#f0f0f0" }}>BODY</span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: 16, color: "#666", lineHeight: 1.8,
            maxWidth: 460, marginBottom: 40,
            animation: "fadeSlideUp 0.7s ease 0.25s both",
          }}>
            Elite AI-powered fitness coaching. Real-time pose detection, personalized nutrition, and voice-guided workouts — all in one platform built for India.
          </p>

          {/* Stats */}
          <div style={{
            display: "flex", gap: 12, marginBottom: 44,
            animation: "fadeSlideUp 0.7s ease 0.35s both",
          }}>
            {[
              { v: "500", s: "+", l: "Active Users" },
              { v: "8",   s: "",  l: "Exercises" },
              { v: "3",   s: "min", l: "Plan Gen." },
              { v: "100", s: "%", l: "Personal." },
            ].map(({ v, s, l }) => (
              <div key={l} style={{
                flex: 1, padding: "14px 12px",
                background: "rgba(15,15,15,0.8)",
                border: "1px solid rgba(40,40,40,0.8)",
                borderRadius: 12, textAlign: "center",
              }}>
                <div style={{
                  fontFamily: "'Bebas Neue', Impact, sans-serif",
                  fontSize: 28, fontWeight: 900,
                  color: "#b91c1c",
                  letterSpacing: "0.05em",
                  lineHeight: 1,
                }}>
                  <Counter end={parseInt(v)} suffix={s} />
                </div>
                <div style={{ fontSize: 10, color: "#555", marginTop: 4, letterSpacing: "0.1em" }}>{l}</div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div style={{
            display: "flex", gap: 14,
            animation: "fadeSlideUp 0.7s ease 0.45s both",
          }}>
            <button onClick={toTrain} className="glow-btn" style={{
              padding: "16px 36px",
              background: "linear-gradient(135deg, #7f1d1d, #b91c1c)",
              border: "none", borderRadius: 10,
              color: "#fff", fontSize: 15, fontWeight: 700,
              cursor: "pointer", letterSpacing: "0.08em",
              boxShadow: "0 8px 32px rgba(185,28,28,0.4)",
              transition: "all 0.25s ease",
            }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = "0 12px 40px rgba(185,28,28,0.6)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = "0 8px 32px rgba(185,28,28,0.4)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >START TRAINING →</button>
            <button onClick={() => document.getElementById("features").scrollIntoView({ behavior: "smooth" })} style={{
              padding: "16px 32px",
              background: "transparent",
              border: "1px solid rgba(80,80,80,0.6)",
              borderRadius: 10, color: "#888",
              fontSize: 15, fontWeight: 600,
              cursor: "pointer", letterSpacing: "0.08em",
              transition: "all 0.25s ease",
            }}
              onMouseEnter={e => { e.target.style.borderColor = "rgba(185,28,28,0.5)"; e.target.style.color = "#f0f0f0"; }}
              onMouseLeave={e => { e.target.style.borderColor = "rgba(80,80,80,0.6)"; e.target.style.color = "#888"; }}
            >EXPLORE</button>
          </div>
        </div>

        {/* Right — HUD Terminal */}
        <div style={{
          flex: 1, display: "flex", justifyContent: "center", alignItems: "center",
          position: "relative",
          animation: "fadeSlideUp 0.8s ease 0.3s both",
        }}>
          {/* Rotating ring */}
          <div style={{
            position: "absolute",
            width: 440, height: 440,
            borderRadius: "50%",
            border: "1px solid rgba(185,28,28,0.12)",
            animation: "rotateSlow 20s linear infinite",
          }}>
            {[0, 90, 180, 270].map(deg => (
              <div key={deg} style={{
                position: "absolute",
                top: "50%", left: "50%",
                width: 8, height: 8,
                borderRadius: "50%",
                background: "rgba(185,28,28,0.6)",
                transform: `rotate(${deg}deg) translateX(220px) translateY(-50%)`,
              }} />
            ))}
          </div>

          {/* Main HUD card */}
          <div style={{
            width: 380,
            background: "rgba(10,10,10,0.9)",
            border: "1px solid rgba(60,60,60,0.6)",
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(185,28,28,0.1) inset",
            backdropFilter: "blur(20px)",
            animation: "borderPulse 4s ease-in-out infinite",
          }}>
            {/* Terminal header */}
            <div style={{
              padding: "14px 18px",
              background: "rgba(185,28,28,0.1)",
              borderBottom: "1px solid rgba(60,60,60,0.5)",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              {["#ef4444", "#f59e0b", "#22c55e"].map(c => (
                <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.8 }} />
              ))}
              <span style={{ fontSize: 11, color: "#444", marginLeft: 8, fontFamily: "monospace", letterSpacing: "0.1em" }}>
                FIT_INDIA_AI — SYSTEM ACTIVE
              </span>
            </div>

            {/* Image placeholder */}
            <div style={{
              position: "relative",
              height: 280,
              background: "linear-gradient(135deg, #0d0d0d 0%, #1a0505 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              overflow: "hidden",
            }}>
              {/* Scanline effect */}
              <div style={{
                position: "absolute",
                left: 0, right: 0, height: 2,
                background: "linear-gradient(90deg, transparent, rgba(185,28,28,0.4), transparent)",
                animation: "scanLine 3s linear infinite",
                pointerEvents: "none",
              }} />
              <img
                src="/hero-ai3.png"
                alt="AI Fitness"
                style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85, display: "block" }}
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.parentElement.style.background = "linear-gradient(135deg, rgba(185,28,28,0.2), #0d0d0d)";
                }}
              />
              {/* Overlay gradient */}
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to bottom, transparent 50%, rgba(10,10,10,1) 100%)",
                pointerEvents: "none",
              }} />
            </div>

            {/* Terminal data */}
            <div style={{ padding: "16px 18px", fontFamily: "monospace" }}>
              <div style={{ fontSize: 10, color: "#b91c1c", marginBottom: 10, letterSpacing: "0.1em" }}>
                ▸ WORKOUT_ANALYSIS_COMPLETE
              </div>
              {[
                { label: "Pose Detection", value: "Real-time ✓", color: "#22c55e" },
                { label: "Form Score", value: "94 / 100", color: "#f59e0b" },
                { label: "Reps Counted", value: "12 auto", color: "#60a5fa" },
                { label: "Status", value: "AI Trainer Active", color: "#b91c1c" },
              ].map(({ label, value, color }) => (
                <div key={label} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "6px 0",
                  borderBottom: "1px solid rgba(30,30,30,0.8)",
                }}>
                  <span style={{ fontSize: 11, color: "#555" }}>{label}</span>
                  <span style={{ fontSize: 11, color, fontWeight: 700 }}>{value}</span>
                </div>
              ))}
              {/* Progress bar */}
              <div style={{ marginTop: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 10, color: "#555" }}>SESSION PROGRESS</span>
                  <span style={{ fontSize: 10, color: "#b91c1c" }}>78%</span>
                </div>
                <div style={{ height: 4, background: "rgba(40,40,40,0.8)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: "78%",
                    background: "linear-gradient(90deg, #7f1d1d, #b91c1c, #ef4444)",
                    borderRadius: 2,
                    boxShadow: "0 0 8px rgba(185,28,28,0.5)",
                  }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          FEATURES SECTION
      ══════════════════════════════════════════════════════════════ */}
      <section id="features" style={{ padding: "100px 48px", position: "relative" }}>
        {/* Section label */}
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{
            display: "inline-block",
            padding: "6px 18px",
            background: "rgba(185,28,28,0.1)",
            border: "1px solid rgba(185,28,28,0.2)",
            borderRadius: 100, marginBottom: 20,
            fontSize: 11, fontWeight: 700, color: "#cc4444",
            letterSpacing: "0.2em",
          }}>CORE CAPABILITIES</div>
          <h2 style={{
            fontFamily: "'Bebas Neue', Impact, sans-serif",
            fontSize: "clamp(48px, 6vw, 80px)",
            fontWeight: 900,
            letterSpacing: "0.02em",
            lineHeight: 0.95,
            color: "#f0f0f0",
            animation: "fadeSlideUp 0.7s ease both",
          }}>
            AI-POWERED<br />
            <span style={{
              background: "linear-gradient(135deg, #b91c1c, #ef4444)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>TRAINING SUITE</span>
          </h2>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
          maxWidth: 1200, margin: "0 auto",
        }}>
          <FeatureCard delay={0}   icon="🎯" accent="#b91c1c" title="POSE DETECTION" desc="MoveNet AI tracks 17 body keypoints at 30 FPS. Real-time skeleton overlay with sub-100ms latency." />
          <FeatureCard delay={100} icon="🔢" accent="#f59e0b" title="AUTO REP COUNT" desc="Intelligent angle-based rep detection. Zero manual input — just exercise and let the AI count." />
          <FeatureCard delay={200} icon="💯" accent="#22c55e" title="FORM SCORING" desc="Live 0-100 form score based on joint angles, posture alignment, and depth metrics." />
          <FeatureCard delay={300} icon="🥗" accent="#60a5fa" title="DIET ENGINE" desc="Mifflin-St Jeor BMR calculation with goal-based macros. Custom meal plans in 3 minutes." />
          <FeatureCard delay={400} icon="🎙️" accent="#a78bfa" title="VOICE COACH" desc="Gemini-powered AI coach. Ask anything about your workout and get real-time voice feedback." />
          <FeatureCard delay={500} icon="📈" accent="#34d399" title="PROGRESS CHARTS" desc="Animated Recharts dashboards showing calories, protein intake, and performance radar." />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          ANALYTICS SECTION (split)
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: "80px 48px", position: "relative", background: "rgba(8,8,8,0.5)" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 60, alignItems: "center", maxWidth: 1200, margin: "0 auto",
        }}>
          {/* Left image */}
          <div style={{ position: "relative" }}>
            <div style={{
              position: "absolute", inset: -2,
              borderRadius: 22,
              background: "linear-gradient(135deg, rgba(185,28,28,0.4), transparent, rgba(185,28,28,0.2))",
              padding: 2,
            }}>
              <div style={{ borderRadius: 20, overflow: "hidden", background: "#0a0a0a" }}>
                <img
                  src="/data-stats-around-person-doing-physical-activity.jpg"
                  alt="Body Analytics"
                  style={{ width: "100%", display: "block", objectFit: "cover", height: 380, filter: "brightness(0.85) contrast(1.1)" }}
                  onError={(e) => {
                    e.target.parentElement.parentElement.style.background = "linear-gradient(135deg, rgba(185,28,28,0.15), #0a0a0a)";
                    e.target.style.display = "none";
                  }}
                />
              </div>
            </div>
            {/* Floating metric */}
            <div style={{
              position: "absolute", bottom: -20, right: -20,
              padding: "16px 20px",
              background: "rgba(10,10,10,0.95)",
              border: "1px solid rgba(185,28,28,0.3)",
              borderRadius: 14,
              backdropFilter: "blur(20px)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            }}>
              <div style={{ fontSize: 10, color: "#555", letterSpacing: "0.1em", marginBottom: 6 }}>LIVE METRICS</div>
              <div style={{ display: "flex", gap: 16 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "#b91c1c", fontFamily: "'Bebas Neue', Impact, sans-serif" }}>129</div>
                  <div style={{ fontSize: 9, color: "#444" }}>BPM</div>
                </div>
                <div style={{ width: 1, background: "rgba(60,60,60,0.6)" }} />
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "#22c55e", fontFamily: "'Bebas Neue', Impact, sans-serif" }}>94%</div>
                  <div style={{ fontSize: 9, color: "#444" }}>FORM</div>
                </div>
                <div style={{ width: 1, background: "rgba(60,60,60,0.6)" }} />
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "#f59e0b", fontFamily: "'Bebas Neue', Impact, sans-serif" }}>AUTO</div>
                  <div style={{ fontSize: 9, color: "#444" }}>REPS</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right content */}
          <div>
            <div style={{
              fontSize: 11, fontWeight: 700, color: "#cc4444",
              letterSpacing: "0.2em", marginBottom: 16,
            }}>AI-POWERED TRACKING</div>
            <h2 style={{
              fontFamily: "'Bebas Neue', Impact, sans-serif",
              fontSize: "clamp(40px, 5vw, 64px)",
              fontWeight: 900, lineHeight: 0.95,
              letterSpacing: "0.02em",
              marginBottom: 20,
              color: "#f0f0f0",
            }}>
              REAL-TIME<br />
              <span style={{
                background: "linear-gradient(135deg, #b91c1c, #ef4444)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>BODY ANALYTICS</span>
            </h2>
            <p style={{ fontSize: 15, color: "#666", lineHeight: 1.8, marginBottom: 32, maxWidth: 420 }}>
              Our AI tracks your form, monitors vital metrics, and provides instant feedback during every workout — just like having a personal trainer by your side.
            </p>
            <div style={{ display: "flex", gap: 10, marginBottom: 32, flexWrap: "wrap" }}>
              {[
                { label: "Pose Detection", value: "Real-time", color: "#b91c1c" },
                { label: "Rep Counting",   value: "Auto",      color: "#f59e0b" },
                { label: "Form Score",     value: "0-100",     color: "#22c55e" },
                { label: "Calories",       value: "Live",      color: "#60a5fa" },
              ].map(({ label, value, color }) => (
                <MetricBox key={label} label={label} value={value} color={color} />
              ))}
            </div>
            <button onClick={toTrain} className="glow-btn" style={{
              padding: "14px 30px",
              background: "linear-gradient(135deg, #7f1d1d, #b91c1c)",
              border: "none", borderRadius: 10,
              color: "#fff", fontSize: 14, fontWeight: 700,
              cursor: "pointer", letterSpacing: "0.08em",
              boxShadow: "0 6px 24px rgba(185,28,28,0.35)",
              transition: "all 0.25s ease",
            }}>START TRACKING →</button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          INTELLIGENT COACHING (reverse split)
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: "80px 48px" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 60, alignItems: "center", maxWidth: 1200, margin: "0 auto",
        }}>
          {/* Left */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#cc4444", letterSpacing: "0.2em", marginBottom: 16 }}>
              INTELLIGENT COACHING
            </div>
            <h2 style={{
              fontFamily: "'Bebas Neue', Impact, sans-serif",
              fontSize: "clamp(40px, 5vw, 64px)",
              fontWeight: 900, lineHeight: 0.95,
              letterSpacing: "0.02em",
              marginBottom: 20,
              color: "#f0f0f0",
            }}>
              EVERY REP.<br />
              <span style={{
                background: "linear-gradient(135deg, #b91c1c, #ef4444)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>PERFECTLY TRACKED.</span>
            </h2>
            <p style={{ fontSize: 15, color: "#666", lineHeight: 1.8, marginBottom: 32, maxWidth: 440 }}>
              Advanced computer vision analyses your movement patterns and gives science-backed feedback to maximize results and prevent injury.
            </p>
            {/* Exercise list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
              {[
                { name: "Squats", muscles: "Quads · Glutes", score: 92 },
                { name: "Push-Ups", muscles: "Chest · Triceps", score: 88 },
                { name: "Deadlift", muscles: "Hamstrings · Back", score: 95 },
                { name: "Bicep Curls", muscles: "Biceps · Forearms", score: 84 },
              ].map(({ name, muscles, score }) => (
                <div key={name} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "12px 16px",
                  background: "rgba(12,12,12,0.8)",
                  border: "1px solid rgba(40,40,40,0.6)",
                  borderRadius: 10,
                  transition: "border-color 0.2s",
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(185,28,28,0.4)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(40,40,40,0.6)"}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#ddd" }}>{name}</div>
                    <div style={{ fontSize: 11, color: "#555" }}>{muscles}</div>
                  </div>
                  <div style={{
                    width: 120, height: 4,
                    background: "rgba(40,40,40,0.8)", borderRadius: 2, overflow: "hidden",
                  }}>
                    <div style={{
                      height: "100%", width: `${score}%`,
                      background: `linear-gradient(90deg, #7f1d1d, #ef4444)`,
                      borderRadius: 2,
                    }} />
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#b91c1c", minWidth: 36, textAlign: "right" }}>
                    {score}%
                  </div>
                </div>
              ))}
            </div>
            <button onClick={toTrain} className="glow-btn" style={{
              padding: "14px 30px",
              background: "linear-gradient(135deg, #7f1d1d, #b91c1c)",
              border: "none", borderRadius: 10,
              color: "#fff", fontSize: 14, fontWeight: 700,
              cursor: "pointer", letterSpacing: "0.08em",
              boxShadow: "0 6px 24px rgba(185,28,28,0.35)",
              transition: "all 0.25s ease",
            }}>START TRAINING →</button>
          </div>

          {/* Right image */}
          <div style={{ position: "relative" }}>
            <div style={{
              position: "absolute", inset: -2, borderRadius: 22,
              background: "linear-gradient(225deg, rgba(185,28,28,0.4), transparent, rgba(185,28,28,0.2))",
              padding: 2,
            }}>
              <div style={{ borderRadius: 20, overflow: "hidden", background: "#0a0a0a" }}>
                <img
                  src="/full-shot-man-doing-sport-with-stats.jpg"
                  alt="Sport Tracking"
                  style={{ width: "100%", display: "block", objectFit: "cover", height: 380, filter: "brightness(0.85) contrast(1.1)" }}
                  onError={(e) => {
                    e.target.parentElement.parentElement.style.background = "linear-gradient(135deg, #0a0a0a, rgba(185,28,28,0.15))";
                    e.target.style.display = "none";
                  }}
                />
              </div>
            </div>
            {/* Calories badge */}
            <div style={{
              position: "absolute", top: -20, left: -20,
              padding: "14px 18px",
              background: "rgba(10,10,10,0.95)",
              border: "1px solid rgba(185,28,28,0.3)",
              borderRadius: 14,
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            }}>
              <div style={{ fontSize: 9, color: "#555", letterSpacing: "0.1em", marginBottom: 4 }}>BEST BURN</div>
              <div style={{
                fontFamily: "'Bebas Neue', Impact, sans-serif",
                fontSize: 26, color: "#ef4444", fontWeight: 900, letterSpacing: "0.05em",
              }}>706 KCAL</div>
              <div style={{ fontSize: 10, color: "#444" }}>Session record</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          PROGRAMS SECTION
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ padding: "80px 48px", background: "rgba(8,8,8,0.5)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{
              display: "inline-block",
              padding: "6px 18px",
              background: "rgba(185,28,28,0.1)",
              border: "1px solid rgba(185,28,28,0.2)",
              borderRadius: 100, marginBottom: 20,
              fontSize: 11, fontWeight: 700, color: "#cc4444",
              letterSpacing: "0.2em",
            }}>PROGRAM GALLERY</div>
            <h2 style={{
              fontFamily: "'Bebas Neue', Impact, sans-serif",
              fontSize: "clamp(44px, 5vw, 72px)",
              fontWeight: 900, letterSpacing: "0.02em", lineHeight: 0.95,
              color: "#f0f0f0",
            }}>
              AI-GENERATED<br />
              <span style={{
                background: "linear-gradient(135deg, #b91c1c, #ef4444)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>TRAINING PROGRAMS</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            <ProgramCard delay={0}   name="Sarah"   level="Beginner"     goal="Strength Rectien Program"  muscles={["Cardio", "Bodyweight", "HIIT"]} />
            <ProgramCard delay={100} name="Michael" level="Intermediate" goal="Michael Bunbition Program" muscles={["Barbell", "Hypertrophy", "PPL"]} />
            <ProgramCard delay={200} name="Elena"   level="Beginner"     goal="General Fitness Goals"     muscles={["Functional", "Core", "Mobility"]} />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          CTA SECTION
      ══════════════════════════════════════════════════════════════ */}
      <section style={{
        padding: "100px 48px",
        position: "relative", overflow: "hidden",
        textAlign: "center",
      }}>
        {/* Big background text */}
        <div style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          fontFamily: "'Bebas Neue', Impact, sans-serif",
          fontSize: "clamp(120px, 20vw, 240px)",
          fontWeight: 900,
          color: "rgba(185,28,28,0.04)",
          letterSpacing: "0.05em",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          userSelect: "none",
        }}>TRANSFORM</div>

        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: "linear-gradient(135deg, #7f1d1d, #b91c1c)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, margin: "0 auto 24px",
            boxShadow: "0 0 40px rgba(185,28,28,0.4)",
            animation: "pulseRed 3s ease-in-out infinite",
          }}>⚡</div>
          <div style={{
            display: "inline-block",
            padding: "6px 18px",
            background: "rgba(185,28,28,0.1)",
            border: "1px solid rgba(185,28,28,0.2)",
            borderRadius: 100, marginBottom: 24,
            fontSize: 11, fontWeight: 700, color: "#cc4444",
            letterSpacing: "0.2em",
          }}>
            <Counter end={500} suffix="+ ACTIVE USERS" />
          </div>
          <h2 style={{
            fontFamily: "'Bebas Neue', Impact, sans-serif",
            fontSize: "clamp(48px, 7vw, 88px)",
            fontWeight: 900, lineHeight: 0.95,
            letterSpacing: "0.02em",
            marginBottom: 24, color: "#f0f0f0",
          }}>
            READY TO<br />
            <span style={{
              background: "linear-gradient(135deg, #b91c1c, #ef4444)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>TRANSFORM?</span>
          </h2>
          <p style={{ fontSize: 16, color: "#666", marginBottom: 40, maxWidth: 460, margin: "0 auto 40px" }}>
            Join India's most advanced AI fitness platform. Get your personalized program in 3 minutes.
          </p>
          <button onClick={toApp} className="glow-btn" style={{
            padding: "18px 48px",
            background: "linear-gradient(135deg, #7f1d1d, #b91c1c)",
            border: "none", borderRadius: 12,
            color: "#fff", fontSize: 16, fontWeight: 800,
            cursor: "pointer", letterSpacing: "0.1em",
            boxShadow: "0 12px 48px rgba(185,28,28,0.5)",
            transition: "all 0.3s ease",
            fontFamily: "'Bebas Neue', Impact, sans-serif",
          }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
              e.currentTarget.style.boxShadow = "0 20px 60px rgba(185,28,28,0.7)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "0 12px 48px rgba(185,28,28,0.5)";
            }}
          >
            {isSignedIn ? "GO TO DASHBOARD →" : "GET STARTED FREE →"}
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        padding: "24px 48px",
        borderTop: "1px solid rgba(30,30,30,0.8)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{
          fontFamily: "'Bebas Neue', Impact, sans-serif",
          fontSize: 18, letterSpacing: "0.1em", color: "#444",
        }}>FIT INDIA<span style={{ color: "#b91c1c" }}>.</span>AI</div>
        <div style={{ display: "flex", gap: 24, fontSize: 12, color: "#444" }}>
          {["Terms", "Privacy", "About Us"].map(item => (
            <a key={item} href="#" style={{
              color: "#444", textDecoration: "none",
              transition: "color 0.2s",
            }}
              onMouseEnter={e => e.target.style.color = "#b91c1c"}
              onMouseLeave={e => e.target.style.color = "#444"}
            >{item}</a>
          ))}
        </div>
      </footer>
    </div>
  );
};

export default Home;