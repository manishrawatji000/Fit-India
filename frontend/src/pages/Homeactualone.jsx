import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth, UserButton } from "@clerk/clerk-react";

/* ─── Animated Counter ─────────────────────────── */
const Counter = ({ end, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const step = end / (1800 / 16);
        const timer = setInterval(() => {
          start += step;
          if (start >= end) { setCount(end); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 16);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);
  return <span ref={ref}>{count}{suffix}</span>;
};

/* ─── Metric Chip ──────────────────────────────── */
const MetricChip = ({ label, value }) => (
  <div style={{
    padding: "10px 14px",
    background: "rgba(255,255,255,0.65)",
    border: "1px solid rgba(180,170,165,0.4)",
    borderRadius: 10,
    backdropFilter: "blur(8px)",
    flex: 1,
    transition: "all 0.25s ease",
  }}
    onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.88)"; e.currentTarget.style.borderColor = "rgba(139,26,43,0.25)"; }}
    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.65)"; e.currentTarget.style.borderColor = "rgba(180,170,165,0.4)"; }}
  >
    <div style={{ fontSize: 14, fontWeight: 800, color: "#8B1A2B", marginBottom: 2, fontFamily: "'DM Sans', sans-serif" }}>{value}</div>
    <div style={{ fontSize: 10, color: "#aaa", letterSpacing: "0.05em", fontFamily: "'DM Sans', sans-serif" }}>{label}</div>
  </div>
);

/* ─── Program Card ─────────────────────────────── */
const ProgramCard = ({ name, goal, tags, hasShield, delay }) => {
  const [hov, setHov] = useState(false);
  const initial = name[0];
  const bgMap = { S: "#8B1A2B", M: "#6B2D8B", E: "#1A5C8B" };
  const bg = bgMap[initial] || "#8B1A2B";
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "rgba(28,16,16,0.97)" : "rgba(20,12,12,0.9)",
        borderRadius: 14, padding: "20px 18px",
        border: `1px solid ${hov ? "rgba(197,64,74,0.5)" : "rgba(80,40,40,0.35)"}`,
        transition: "all 0.3s ease",
        transform: hov ? "translateY(-5px)" : "none",
        boxShadow: hov ? "0 20px 48px rgba(0,0,0,0.55)" : "0 4px 16px rgba(0,0,0,0.4)",
        animation: `fadeUp 0.7s ease ${delay}ms both`,
        cursor: "default",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 8,
          background: `linear-gradient(135deg, ${bg}, ${bg}aa)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 15, fontWeight: 800, color: "#fff",
          fontFamily: "'DM Sans', sans-serif",
        }}>{initial}</div>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#f0e8e8", fontFamily: "'DM Sans', sans-serif" }}>
          {name}<span style={{ color: "#c5404a" }}>.exe</span>
        </span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
        {tags.map(t => (
          <span key={t} style={{
            padding: "3px 10px", borderRadius: 20,
            background: "rgba(197,64,74,0.1)",
            border: "1px solid rgba(197,64,74,0.22)",
            fontSize: 11, color: "#cc8888",
            fontFamily: "'DM Sans', sans-serif",
          }}>{t}</span>
        ))}
      </div>
      <div style={{ fontSize: 10, color: "#555", letterSpacing: "0.06em", marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>Goal</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#e8d8d8", fontFamily: "'DM Sans', sans-serif" }}>{goal}</div>
      {hasShield && (
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "rgba(197,64,74,0.08)", borderRadius: 8, border: "1px solid rgba(197,64,74,0.15)" }}>
          <span style={{ fontSize: 16 }}>🛡️</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#a8d8a8", fontFamily: "'DM Sans', sans-serif" }}>AI Safety Protocols</div>
            <div style={{ fontSize: 10, color: "#555", fontFamily: "'DM Sans', sans-serif" }}>Protection systems enabled</div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Main Home ─────────────────────────────────── */
const Home = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const toApp   = () => navigate(isSignedIn ? "/dashboard" : "/sign-up");
  const toTrain = () => navigate(isSignedIn ? "/workout"   : "/sign-up");

  return (
    <div style={{ background: "#F5F0EE", color: "#1a0808", fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", overflowX: "hidden" }}>

      {/* ── STYLES ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #F5F0EE; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideLeft {
          from { opacity: 0; transform: translateX(-28px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(28px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes waveA {
          0%,100% { border-radius: 60% 40% 70% 30% / 50% 60% 40% 50%; transform: translateY(0) rotate(0deg) scale(1); }
          33%  { border-radius: 50% 50% 40% 60% / 60% 40% 70% 30%; transform: translateY(-14px) rotate(3deg) scale(1.02); }
          66%  { border-radius: 70% 30% 55% 45% / 40% 65% 35% 60%; transform: translateY(-7px) rotate(-2deg) scale(1.01); }
        }
        @keyframes waveB {
          0%,100% { border-radius: 40% 60% 50% 50% / 60% 40% 60% 40%; transform: translateY(0) scale(1); }
          50%  { border-radius: 60% 40% 65% 35% / 35% 65% 35% 65%; transform: translateY(-18px) scale(1.03); }
        }
        @keyframes waveC {
          0%,100% { transform: rotate(-4deg) scale(1.05) translateY(0); }
          50%  { transform: rotate(4deg) scale(1.08) translateY(-8px); }
        }
        @keyframes scanline {
          0%   { top: -2px; opacity: 0.8; }
          80%  { opacity: 0.4; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes glowPulse {
          0%,100% { box-shadow: 0 0 18px rgba(139,26,43,0.28); }
          50%  { box-shadow: 0 0 36px rgba(139,26,43,0.55); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes breathe {
          0%,100% { opacity: 1; transform: scale(1); }
          50%  { opacity: 0.7; transform: scale(0.96); }
        }
        @keyframes borderPulse {
          0%,100% { border-color: rgba(139,26,43,0.15); }
          50%  { border-color: rgba(139,26,43,0.45); }
        }
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .crimson-btn {
          background: linear-gradient(135deg, #6B0A1A 0%, #8B1A2B 55%, #A83040 100%);
          color: #fff; border: none; cursor: pointer;
          position: relative; overflow: hidden;
          transition: all 0.28s ease;
          font-family: 'DM Sans', sans-serif;
        }
        .crimson-btn::after {
          content: '';
          position: absolute; top: 0; left: -100%;
          width: 55%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent);
          transform: skewX(-20deg);
          transition: left 0.55s ease;
        }
        .crimson-btn:hover::after { left: 160%; }
        .crimson-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(139,26,43,0.48) !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #F5F0EE; }
        ::-webkit-scrollbar-thumb { background: #8B1A2B; border-radius: 2px; }
      `}</style>

      {/* ══════════════ NAVBAR ══════════════ */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 44px", height: 58,
        background: scrolled ? "rgba(245,240,238,0.97)" : "rgba(245,240,238,0.85)",
        backdropFilter: "blur(18px)",
        borderBottom: `1px solid ${scrolled ? "rgba(139,26,43,0.14)" : "rgba(210,195,190,0.4)"}`,
        transition: "all 0.3s ease",
      }}>
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: "linear-gradient(135deg, #6B0A1A, #8B1A2B)",
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "glowPulse 3s ease-in-out infinite",
          }}>
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L18 7V13L10 18L2 13V7L10 2Z" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" fill="none"/>
              <path d="M10 6L14 8.5V11.5L10 14L6 11.5V8.5L10 6Z" fill="rgba(255,255,255,0.35)"/>
            </svg>
          </div>
          <span style={{ fontWeight: 600, fontSize: 17, color: "#1a0808", letterSpacing: "0.01em" }}>
            fit india<span style={{ color: "#A52535" }}>.</span><span style={{ color: "#8B1A2B" }}>ai</span>
          </span>
        </Link>

        <nav style={{ display: "flex", alignItems: "center", gap: 30 }}>
          {["Home", "Generate", "Profile"].map(item => (
            <a key={item} href="#" style={{
              fontSize: 14, color: "#666", textDecoration: "none",
              fontWeight: 500, transition: "color 0.2s",
            }}
              onMouseEnter={e => e.target.style.color = "#8B1A2B"}
              onMouseLeave={e => e.target.style.color = "#666"}
            >{item}</a>
          ))}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {isSignedIn ? (
            <>
              <button onClick={() => navigate("/dashboard")} className="crimson-btn" style={{
                padding: "8px 20px", borderRadius: 8,
                fontSize: 13, fontWeight: 600, letterSpacing: "0.02em",
                boxShadow: "0 4px 16px rgba(139,26,43,0.28)",
              }}>Launch Dashboard</button>
              <UserButton afterSignOutUrl="/" appearance={{
                variables: { colorPrimary: "#8B1A2B" },
                elements: { avatarBox: { width: 32, height: 32, border: "2px solid rgba(139,26,43,0.35)", borderRadius: "50%" } },
              }} />
            </>
          ) : (
            <>
              <Link to="/sign-in" style={{
                fontSize: 14, color: "#666", textDecoration: "none",
                fontWeight: 500, transition: "color 0.2s",
              }}
                onMouseEnter={e => e.target.style.color = "#8B1A2B"}
                onMouseLeave={e => e.target.style.color = "#666"}
              >Sign In</Link>
              <button onClick={toApp} className="crimson-btn" style={{
                padding: "8px 20px", borderRadius: 8,
                fontSize: 13, fontWeight: 600, letterSpacing: "0.02em",
                boxShadow: "0 4px 16px rgba(139,26,43,0.28)",
              }}>Launch Dashboard</button>
            </>
          )}
        </div>
      </header>

      {/* ══════════════ HERO ══════════════ */}
      <section style={{
        position: "relative",
        display: "grid", gridTemplateColumns: "1fr 1fr",
        minHeight: "calc(100vh - 58px)",
        overflow: "hidden",
      }}>
        {/* Animated wave blobs */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
          {/* Main large warm blob — top right */}
          <div style={{
            position: "absolute",
            top: "-18%", right: "-8%",
            width: "58%", height: "95%",
            background: "radial-gradient(ellipse at 55% 40%, rgba(215,130,110,0.38) 0%, rgba(195,95,80,0.22) 45%, rgba(215,150,120,0.08) 70%, transparent 85%)",
            animation: "waveA 9s ease-in-out infinite",
            filter: "blur(1px)",
          }} />
          {/* Secondary mid blob */}
          <div style={{
            position: "absolute",
            top: "5%", right: "2%",
            width: "48%", height: "85%",
            background: "radial-gradient(ellipse at 45% 55%, rgba(185,90,80,0.18) 0%, rgba(220,140,110,0.1) 55%, transparent 75%)",
            animation: "waveB 11s ease-in-out 2s infinite",
            filter: "blur(0.5px)",
          }} />
          {/* Bottom accent */}
          <div style={{
            position: "absolute",
            bottom: "-15%", right: "5%",
            width: "50%", height: "55%",
            background: "radial-gradient(ellipse at 55% 80%, rgba(200,115,95,0.16) 0%, transparent 65%)",
            animation: "waveC 13s ease-in-out 4s infinite",
          }} />
          {/* Subtle grid */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: "linear-gradient(rgba(139,26,43,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(139,26,43,0.022) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }} />
        </div>

        {/* LEFT — Text */}
        <div style={{
          position: "relative", zIndex: 2,
          padding: "90px 48px 80px 60px",
          display: "flex", flexDirection: "column", justifyContent: "center",
        }}>
          {/* Corner bracket */}
          <div style={{
            position: "absolute", top: 44, left: 38,
            width: 26, height: 26,
            borderTop: "2px solid rgba(139,26,43,0.28)",
            borderLeft: "2px solid rgba(139,26,43,0.28)",
          }} />

          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(40px, 5.2vw, 66px)",
            fontWeight: 900, lineHeight: 1.06,
            letterSpacing: "-0.015em",
            color: "#8B1A2B",
            marginBottom: 20,
            animation: "slideLeft 0.85s ease both",
          }}>
            TRANSFORM<br/>
            YOUR BODY<br/>
            WITH ADVANCED<br/>
            AI TECHNOLOGY
          </h1>

          <p style={{
            fontSize: 15, color: "#666", lineHeight: 1.75,
            maxWidth: 380, marginBottom: 38,
            animation: "slideLeft 0.85s ease 0.1s both",
          }}>
            Talk to our AI assistant and get personalized diet plans and workout routines designed just for you.
          </p>

          {/* Stats */}
          <div style={{
            display: "flex", gap: 28, marginBottom: 38,
            animation: "fadeUp 0.8s ease 0.2s both",
          }}>
            {[
              { v: 500, s: "+", l: "ACTIVE USERS" },
              { v: 3,   s: "min", l: "GENERATION" },
              { v: 100, s: "%",  l: "PERSONALIZED" },
            ].map(({ v, s, l }) => (
              <div key={l}>
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 30, fontWeight: 900, color: "#8B1A2B", lineHeight: 1,
                }}>
                  <Counter end={v} suffix={s} />
                </div>
                <div style={{ fontSize: 9, color: "#aaa", letterSpacing: "0.12em", marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>

          <button onClick={toTrain} className="crimson-btn" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "14px 28px", borderRadius: 10,
            fontSize: 14, fontWeight: 700, letterSpacing: "0.04em",
            boxShadow: "0 6px 24px rgba(139,26,43,0.32)",
            animation: "fadeUp 0.8s ease 0.3s both",
            width: "fit-content",
          }}>
            Build Your Program →
          </button>
        </div>

        {/* RIGHT — Hero Image */}
        <div style={{
          position: "relative", zIndex: 2,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "48px 40px 48px 20px",
          animation: "slideRight 0.9s ease 0.15s both",
        }}>
          <div style={{
            position: "relative", width: "100%", maxWidth: 500,
            borderRadius: 16, overflow: "hidden",
            border: "1px solid rgba(139,26,43,0.13)",
            boxShadow: "0 28px 72px rgba(100,28,28,0.22)",
            animation: "borderPulse 4s ease-in-out infinite",
          }}>
            <img
              src="/hero-ai3.png"
              alt="AI Fitness Trainer"
              style={{ width: "100%", height: 420, objectFit: "cover", display: "block" }}
            />
            {/* Scan line */}
            <div style={{
              position: "absolute", left: 0, right: 0, height: 2,
              background: "linear-gradient(90deg, transparent, rgba(139,26,43,0.55), transparent)",
              animation: "scanline 3.5s linear infinite",
              pointerEvents: "none",
            }} />
            {/* Bottom terminal overlay */}
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              background: "linear-gradient(to top, rgba(8,3,3,0.96) 55%, transparent)",
              padding: "36px 18px 16px",
              fontFamily: "monospace",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                <span style={{ fontSize: 10, color: "#c5404a", letterSpacing: "0.08em" }}>⬤ SYSTEM ACTIVE</span>
                <span style={{ fontSize: 10, color: "#444" }}>ID: 78412.93</span>
              </div>
              <div style={{ fontSize: 10, color: "#bbb", marginBottom: 5 }}>▸ WORKOUT_ANALYSIS_COMPLETE</div>
              <div style={{ fontSize: 10, color: "#c5888e", lineHeight: 1.65 }}>
                01 TB mia strength_training (upper body)<br/>
                02 TB mia cardio_session (moderate)<br/>
                03 TB mia flexibility (recovery mode)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ PROGRAMS SECTION ══════════════ */}
      <section style={{
        padding: "80px 60px",
        background: "#EDE8E5",
        position: "relative", overflow: "hidden",
      }}>
        {/* Wave blob */}
        <div style={{
          position: "absolute", bottom: "-20%", left: "-5%",
          width: "45%", height: "100%",
          background: "radial-gradient(ellipse at 30% 70%, rgba(200,115,95,0.18) 0%, transparent 60%)",
          animation: "waveB 10s ease-in-out 1.5s infinite",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", top: "-10%", right: "0%",
          width: "40%", height: "80%",
          background: "radial-gradient(ellipse at 70% 30%, rgba(215,130,105,0.12) 0%, transparent 65%)",
          animation: "waveA 12s ease-in-out infinite",
          pointerEvents: "none",
        }} />

        <div style={{ textAlign: "center", marginBottom: 44, position: "relative", zIndex: 2 }}>
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(28px, 3.8vw, 46px)",
            fontWeight: 900, color: "#8B1A2B",
            letterSpacing: "-0.01em",
            marginBottom: 12,
            animation: "fadeUp 0.7s ease both",
          }}>AI-Generated Programs</h2>
          <p style={{
            fontSize: 15, color: "#888",
            maxWidth: 460, margin: "0 auto",
            animation: "fadeUp 0.7s ease 0.1s both",
          }}>
            Talk to our Ai assistant and get personalized diet plans and workout routines designed just for you.
          </p>
        </div>

        {/* Stats bar */}
        <div style={{
          display: "flex", justifyContent: "center", alignItems: "center",
          gap: 48, marginBottom: 44, position: "relative", zIndex: 2,
        }}>
          {[
            { v: 500, s: "+", l: "ACTIVE USERS" },
            { v: 3,   s: "min", l: "GENERATION", icon: "⏱" },
            { v: 100, s: "%",  l: "PERSONALIZED" },
          ].map(({ v, s, l, icon }) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 28, fontWeight: 900, color: "#8B1A2B",
                display: "flex", alignItems: "center", gap: 4,
              }}>
                {icon && <span style={{ fontSize: 18 }}>{icon}</span>}
                <Counter end={v} suffix={s} />
              </div>
              <div style={{ fontSize: 9, color: "#aaa", letterSpacing: "0.12em", marginTop: 3 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Tracking label */}
        <div style={{ textAlign: "center", marginBottom: 12, position: "relative", zIndex: 2 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#8B1A2B", letterSpacing: "0.15em" }}>AI-POWERED TRACKING</span>
        </div>
        <h3 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "clamp(24px, 3.2vw, 38px)",
          fontWeight: 900, color: "#1a0808",
          textAlign: "center", marginBottom: 40,
          letterSpacing: "-0.01em", position: "relative", zIndex: 2,
          animation: "fadeUp 0.7s ease 0.15s both",
        }}>Real-Time<br/>Body Analytics</h3>

        {/* Cards */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16, maxWidth: 860, margin: "0 auto",
          position: "relative", zIndex: 2,
        }}>
          <ProgramCard delay={0}   name="Sarah"   goal="Serength Rectien Program"  tags={["Thatd", "Marlein"]}  hasShield={false} />
          <ProgramCard delay={100} name="Michael" goal="Michael Bunbition Program" tags={["Srengh", "Recineh"]} hasShield={false} />
          <ProgramCard delay={200} name="Elena"   goal="General Fitness Program"   tags={["Sheue", "Murttoul"]} hasShield={true}  />
        </div>
      </section>

      {/* ══════════════ BODY ANALYTICS ══════════════ */}
      <section style={{
        padding: "80px 60px",
        background: "#F5F0EE",
        position: "relative", overflow: "hidden",
      }}>
        {/* Wave right */}
        <div style={{
          position: "absolute", top: 0, right: "-8%",
          width: "55%", height: "110%",
          background: "radial-gradient(ellipse at 65% 45%, rgba(210,125,105,0.22) 0%, rgba(190,88,75,0.12) 45%, transparent 72%)",
          animation: "waveA 8s ease-in-out 0.5s infinite",
          pointerEvents: "none",
          filter: "blur(1px)",
        }} />

        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 64, alignItems: "center", maxWidth: 1200, margin: "0 auto",
          position: "relative", zIndex: 2,
        }}>
          {/* Text */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#8B1A2B", letterSpacing: "0.15em", marginBottom: 16, animation: "slideLeft 0.7s ease both" }}>
              AI-POWERED TRACKING
            </div>
            <h2 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(28px, 3.8vw, 50px)",
              fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.015em",
              color: "#1a0808", marginBottom: 18,
              animation: "slideLeft 0.7s ease 0.1s both",
            }}>
              Real-Time<br/>Body Analytics
            </h2>
            <p style={{
              fontSize: 15, color: "#666", lineHeight: 1.78,
              maxWidth: 400, marginBottom: 32,
              animation: "slideLeft 0.7s ease 0.2s both",
            }}>
              Our AI track your form, monitors vital metrics and provides feedback during every workout — just like being a personal trainer.
            </p>
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr",
              gap: 10, maxWidth: 360,
              animation: "fadeUp 0.7s ease 0.3s both",
            }}>
              {[
                { label: "Pose Detection", value: "Real-time" },
                { label: "Rep Counting",   value: "Auto" },
                { label: "Form Score",     value: "0-100" },
                { label: "Calories",       value: "Live" },
              ].map(p => <MetricChip key={p.label} {...p} />)}
            </div>
          </div>

          {/* Image */}
          <div style={{ position: "relative", animation: "slideRight 0.8s ease 0.1s both" }}>
            <div style={{
              borderRadius: 16, overflow: "hidden",
              border: "1px solid rgba(139,26,43,0.11)",
              boxShadow: "0 22px 64px rgba(100,28,28,0.18)",
            }}>
              <img src="/data-stats-around-person-doing-physical-activity.jpg" alt="Body Analytics"
                style={{ width: "100%", height: 330, objectFit: "cover", display: "block" }} />
            </div>
            {/* BPM badge */}
            <div style={{
              position: "absolute", top: 14, right: 14,
              padding: "10px 14px",
              background: "rgba(8,4,4,0.9)",
              borderRadius: 10, backdropFilter: "blur(14px)",
              border: "1px solid rgba(139,26,43,0.3)",
              textAlign: "center",
            }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1 }}>129</div>
              <div style={{ fontSize: 9, color: "#888", letterSpacing: "0.1em", marginTop: 1 }}>BPM</div>
            </div>
            {/* Label */}
            <div style={{
              position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)",
              padding: "6px 18px",
              background: "rgba(139,26,43,0.88)",
              borderRadius: 8, backdropFilter: "blur(10px)",
              fontSize: 11, fontWeight: 700, color: "#fff", letterSpacing: "0.08em",
              whiteSpace: "nowrap",
            }}>Fit India</div>
          </div>
        </div>
      </section>

      {/* ══════════════ INTELLIGENT COACHING ══════════════ */}
      <section style={{
        padding: "80px 60px",
        background: "#EDE8E5",
        position: "relative", overflow: "hidden",
      }}>
        {/* Wave left */}
        <div style={{
          position: "absolute", top: "5%", left: "-6%",
          width: "48%", height: "90%",
          background: "radial-gradient(ellipse at 35% 50%, rgba(200,108,88,0.2) 0%, transparent 62%)",
          animation: "waveB 10s ease-in-out 3s infinite",
          pointerEvents: "none",
        }} />

        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 64, alignItems: "center", maxWidth: 1200, margin: "0 auto",
          position: "relative", zIndex: 2,
        }}>
          {/* Image */}
          <div style={{ position: "relative", animation: "slideLeft 0.8s ease both" }}>
            <div style={{
              borderRadius: 16, overflow: "hidden",
              border: "1px solid rgba(139,26,43,0.11)",
              boxShadow: "0 22px 64px rgba(100,28,28,0.18)",
            }}>
              <img src="/full-shot-man-doing-sport-with-stats.jpg" alt="Sport Tracking"
                style={{ width: "100%", height: 330, objectFit: "cover", display: "block" }} />
            </div>
            {/* Analysis bar */}
            <div style={{
              position: "absolute", bottom: 14, left: 14, right: 14,
              background: "rgba(8,4,4,0.9)", borderRadius: 10,
              backdropFilter: "blur(12px)", padding: "10px 14px",
              border: "1px solid rgba(139,26,43,0.22)",
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#a8d8a8", marginBottom: 3 }}>
                🟢 The Back — Best Calories Loss
              </div>
              <div style={{ fontSize: 10, color: "#666" }}>
                X91 body 8dy · 31T mumble woun · Casct cato: 175 bpm
              </div>
            </div>
          </div>

          {/* Text */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#8B1A2B", letterSpacing: "0.15em", marginBottom: 16, animation: "slideRight 0.7s ease both" }}>
              INTELLIGENT COACHING
            </div>
            <h2 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(28px, 3.8vw, 52px)",
              fontWeight: 900, lineHeight: 1.06, letterSpacing: "-0.015em",
              color: "#1a0808", marginBottom: 20,
              animation: "slideRight 0.7s ease 0.1s both",
            }}>
              Every Rep.<br/>
              <span style={{
                background: "linear-gradient(135deg, #6B0A1A 0%, #c5404a 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>Perfectly Tracked.</span>
            </h2>
            <p style={{
              fontSize: 15, color: "#666", lineHeight: 1.78,
              maxWidth: 400, marginBottom: 32,
              animation: "slideRight 0.7s ease 0.2s both",
            }}>
              Advanced computer vision analyse your movement patterns and gives science-backed feedback to maximize results and prevent injury.
            </p>
            <button onClick={toTrain} className="crimson-btn" style={{
              padding: "13px 28px", borderRadius: 10,
              fontSize: 14, fontWeight: 700, letterSpacing: "0.04em",
              boxShadow: "0 6px 24px rgba(139,26,43,0.3)",
              animation: "fadeUp 0.7s ease 0.3s both",
            }}>
              Start Training →
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════ CTA ══════════════ */}
      <section style={{
        padding: "90px 60px",
        position: "relative", overflow: "hidden",
        textAlign: "center",
        background: "linear-gradient(160deg, #EDE8E5 0%, #E6DDD8 40%, #ECDDD8 100%)",
      }}>
        {/* Animated wave blobs */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
          <div style={{
            position: "absolute", top: "-25%", left: "25%",
            width: "50%", height: "150%",
            background: "radial-gradient(ellipse at 50% 40%, rgba(200,108,90,0.28) 0%, rgba(220,140,118,0.15) 45%, transparent 72%)",
            animation: "waveA 8s ease-in-out infinite",
          }} />
          <div style={{
            position: "absolute", bottom: "-30%", right: "5%",
            width: "40%", height: "120%",
            background: "radial-gradient(ellipse at 60% 65%, rgba(175,78,68,0.2) 0%, transparent 68%)",
            animation: "waveB 11s ease-in-out 2s infinite",
          }} />
          <div style={{
            position: "absolute", top: "10%", left: "-5%",
            width: "35%", height: "80%",
            background: "radial-gradient(ellipse at 20% 40%, rgba(210,120,98,0.12) 0%, transparent 60%)",
            animation: "waveC 14s ease-in-out 5s infinite",
          }} />
        </div>

        <div style={{ position: "relative", zIndex: 2 }}>
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(32px, 4.8vw, 58px)",
            fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1.1,
            color: "#1a0808", marginBottom: 0,
            animation: "fadeUp 0.7s ease both",
          }}>
            Ready to Transform?{" "}
            <span style={{
              background: "linear-gradient(135deg, #6B0A1A 0%, #c5404a 60%, #8B1A2B 100%)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              animation: "shimmer 3s linear infinite",
            }}>
              <Counter end={500} suffix="+" />
            </span>
          </h2>
          <p style={{
            fontSize: 15, color: "#888",
            margin: "16px auto 36px", maxWidth: 420,
            animation: "fadeUp 0.7s ease 0.1s both",
          }}>
            Join India's leading AI fitness platform. Your personalized plan is 3 minutes away.
          </p>
          <button onClick={toApp} className="crimson-btn" style={{
            padding: "16px 48px", borderRadius: 12,
            fontSize: 16, fontWeight: 800, letterSpacing: "0.04em",
            boxShadow: "0 10px 40px rgba(139,26,43,0.38)",
            animation: "fadeUp 0.7s ease 0.2s both",
          }}>
            Go to Dashboard
          </button>
        </div>
      </section>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer style={{
        padding: "18px 60px",
        borderTop: "1px solid rgba(139,26,43,0.1)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "#EDE8E5",
      }}>
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 22, height: 22, borderRadius: 6,
            background: "linear-gradient(135deg, #6B0A1A, #8B1A2B)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="11" height="11" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L18 7V13L10 18L2 13V7L10 2Z" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" fill="none"/>
            </svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 500, color: "#aaa" }}>
            fit india<span style={{ color: "#A52535" }}>.</span>ai
          </span>
        </Link>

        {/* Scroll to top */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{
            width: 28, height: 28, borderRadius: "50%",
            border: "1px solid rgba(139,26,43,0.2)",
            background: "transparent", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "breathe 2.5s ease-in-out infinite",
            transition: "border-color 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(139,26,43,0.5)"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(139,26,43,0.2)"}
        >
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M6 10V2M6 2L2 6M6 2L10 6" stroke="#8B1A2B" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

        <div style={{ display: "flex", gap: 24 }}>
          {["Terms", "Privacy", "About Us"].map(item => (
            <a key={item} href="#" style={{
              fontSize: 13, color: "#aaa", textDecoration: "none",
              transition: "color 0.2s",
            }}
              onMouseEnter={e => e.target.style.color = "#8B1A2B"}
              onMouseLeave={e => e.target.style.color = "#aaa"}
            >{item}</a>
          ))}
        </div>
      </footer>
    </div>
  );
};

export default Home;