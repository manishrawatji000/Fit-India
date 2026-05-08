import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth, UserButton } from "@clerk/clerk-react";
import API from "../api";

/* ── Animated counter ── */
const Counter = ({ end, suffix = "" }) => {
  const [n, setN] = useState(0);
  const ref = useRef(null);
  const done = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !done.current) {
        done.current = true;
        let v = 0;
        const step = end / (1600 / 16);
        const t = setInterval(() => {
          v += step;
          if (v >= end) { setN(end); clearInterval(t); }
          else setN(Math.floor(v));
        }, 16);
      }
    }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);
  return <span ref={ref}>{n.toLocaleString()}{suffix}</span>;
};

/* ── How-it-works step card ── */
const StepCard = ({ num, icon, title, desc, delay }) => {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "#fff" : "#F9FAF7",
        border: `1.5px solid ${hov ? "#8DC63F" : "#E4EAD8"}`,
        borderRadius: 18,
        padding: "32px 24px",
        transition: "all 0.3s ease",
        transform: hov ? "translateY(-6px)" : "none",
        boxShadow: hov ? "0 16px 40px rgba(141,198,63,0.18)" : "0 2px 12px rgba(0,0,0,0.04)",
        animation: `fadeUp 0.7s ease ${delay}ms both`,
        cursor: "default",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{
        position: "absolute", top: 16, right: 18,
        fontFamily: "'Syne', sans-serif",
        fontSize: 44, fontWeight: 900,
        color: hov ? "rgba(141,198,63,0.12)" : "rgba(0,0,0,0.04)",
        lineHeight: 1, transition: "color 0.3s",
      }}>{String(num).padStart(2, "0")}</div>
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: hov ? "rgba(141,198,63,0.15)" : "rgba(141,198,63,0.08)",
        border: `1.5px solid ${hov ? "#8DC63F" : "#D5E8A8"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 26, marginBottom: 18,
        transition: "all 0.3s",
        transform: hov ? "scale(1.08) rotate(-4deg)" : "none",
      }}>{icon}</div>
      <h3 style={{
        fontFamily: "'Syne', sans-serif",
        fontSize: 18, fontWeight: 700,
        color: "#1A2B0A", marginBottom: 10,
      }}>{title}</h3>
      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 14, color: "#667755",
        lineHeight: 1.72,
      }}>{desc}</p>
    </div>
  );
};

/* ── Why card ── */
const WhyCard = ({ icon, title, desc, delay }) => {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "24px 20px",
        borderRadius: 14,
        border: `1px solid ${hov ? "rgba(141,198,63,0.55)" : "rgba(141,198,63,0.2)"}`,
        background: hov ? "rgba(141,198,63,0.06)" : "transparent",
        transition: "all 0.28s ease",
        transform: hov ? "translateY(-4px)" : "none",
        animation: `fadeUp 0.7s ease ${delay}ms both`,
        cursor: "default",
      }}
    >
      <div style={{
        fontSize: 32, marginBottom: 14,
        filter: hov ? "drop-shadow(0 4px 8px rgba(141,198,63,0.4))" : "none",
        transition: "filter 0.3s",
        display: "inline-block",
        transform: hov ? "scale(1.1)" : "none",
      }}>{icon}</div>
      <h4 style={{
        fontFamily: "'Syne', sans-serif",
        fontSize: 16, fontWeight: 700,
        color: "#E8F5C8", marginBottom: 8,
      }}>{title}</h4>
      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 13, color: "rgba(200,220,160,0.75)",
        lineHeight: 1.65,
      }}>{desc}</p>
    </div>
  );
};

/* ── Pricing card ── */
const PricingCard = ({ plan, price, period, desc, features, cta, highlight, badge, delay, onSelectPlan }) => {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: highlight ? "linear-gradient(145deg, #1A2B0A, #2D4A10)" : "#fff",
        border: `2px solid ${highlight ? "#8DC63F" : hov ? "#8DC63F" : "#E4EAD8"}`,
        borderRadius: 20,
        padding: "36px 28px",
        position: "relative",
        transition: "all 0.3s ease",
        transform: hov && !highlight ? "translateY(-6px)" : highlight ? "translateY(-10px) scale(1.03)" : "none",
        boxShadow: highlight
          ? "0 24px 60px rgba(141,198,63,0.25), 0 0 0 1px rgba(141,198,63,0.15)"
          : hov ? "0 16px 40px rgba(0,0,0,0.1)" : "0 2px 12px rgba(0,0,0,0.05)",
        animation: `fadeUp 0.7s ease ${delay}ms both`,
      }}
    >
      {badge && (
        <div style={{
          position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)",
          background: "#8DC63F", color: "#1A2B0A",
          fontFamily: "'Syne', sans-serif",
          padding: "4px 18px", borderRadius: 99,
          fontSize: 12, fontWeight: 700, letterSpacing: "0.06em",
          whiteSpace: "nowrap",
        }}>{badge}</div>
      )}
      <div style={{ marginBottom: 8 }}>
        <span style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: 20, fontWeight: 800,
          color: highlight ? "#C8E87A" : "#1A2B0A",
        }}>{plan}</span>
      </div>
      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 13, color: highlight ? "rgba(200,232,122,0.7)" : "#888",
        marginBottom: 20, lineHeight: 1.5,
      }}>{desc}</p>
      <div style={{ marginBottom: 24 }}>
        <span style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: 38, fontWeight: 900,
          color: highlight ? "#C8E87A" : "#1A2B0A",
        }}>₹{price}</span>
        <span style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14, color: highlight ? "rgba(200,232,122,0.6)" : "#aaa",
          marginLeft: 4,
        }}>{period}</span>
      </div>
      <div style={{ marginBottom: 28 }}>
        {features.map((f, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "flex-start", gap: 10,
            marginBottom: 10,
          }}>
            <span style={{
              fontSize: 15,
              color: highlight ? "#8DC63F" : "#8DC63F",
              marginTop: 1, flexShrink: 0,
            }}>✓</span>
            <span style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14, color: highlight ? "#D8EEA0" : "#444",
              lineHeight: 1.5,
            }}>{f}</span>
          </div>
        ))}
      </div>
      <button style={{
        width: "100%",
        padding: "13px 0",
        borderRadius: 10,
        border: highlight ? "none" : `1.5px solid ${hov ? "#8DC63F" : "#CCD9AA"}`,
        background: highlight ? "#8DC63F" : hov ? "#8DC63F" : "transparent",
        color: highlight ? "#1A2B0A" : hov ? "#1A2B0A" : "#3A5A1A",
        fontFamily: "'Syne', sans-serif",
        fontSize: 15, fontWeight: 700,
        cursor: "pointer",
        transition: "all 0.25s ease",
        letterSpacing: "0.02em",
      }} onClick={() => onSelectPlan && onSelectPlan(plan)}>{cta}</button>
    </div>
  );
};

/* ═══════════════════════════════════════
   MAIN HOME COMPONENT
═══════════════════════════════════════ */
const Home = () => {
  const navigate = useNavigate();
  const { isSignedIn, user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const handleUpgrade = async (plan) => {
    if (!isSignedIn) {
      navigate("/sign-in");
      return;
    }
    if (plan === "Basic") return;

    try {
      const res = await new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });

      if (!res) {
        alert("Razorpay SDK failed to load. Please check your internet connection.");
        return;
      }

      // Create exact order on the backend to prevent users changing the amount
      const { data: order } = await API.post("/payment/create-order", { plan });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder",
        amount: order.amount, // Locked to exactly ₹799 or ₹1499
        currency: "INR",
        name: "FitIndia.ai",
        description: `Upgrade to ${plan} Plan`,
        order_id: order.id,
        handler: async function (response) {
          try {
            const verifyRes = await API.post("/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan
            });
            localStorage.setItem("fitindia_tier", verifyRes.data.tier);
            alert(`🎉 Success! Payment verified. You are now a ${verifyRes.data.tier} member!`);
            navigate("/dashboard"); // Automatic redirect!
          } catch (err) {
            alert("Payment verification failed. If money was deducted, please contact support.");
          }
        },
        prefill: {
          name: user?.fullName || "FitIndia User",
          email: user?.primaryEmailAddress?.emailAddress || "",
        },
        theme: { color: "#8DC63F" }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response){
        alert("Payment failed or cancelled! Reason: " + response.error.description);
      });
      rzp1.open();
    } catch (err) {
      console.error(err);
      alert("Error initiating secure payment. Make sure backend is running.");
    }
  };

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenu(false);
  };

  return (
    <div style={{
      background: "#F7F9F2",
      color: "#1A2B0A",
      fontFamily: "'DM Sans', sans-serif",
      minHeight: "100vh",
      overflowX: "hidden",
    }}>

      {/* ── GLOBAL STYLES ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Syne:wght@600;700;800;900&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #F7F9F2; margin: 0; padding: 0; }
        #root { margin: 0; padding: 0; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.94); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes float {
          0%,100% { transform: translateY(0px); }
          50%  { transform: translateY(-10px); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulseGreen {
          0%,100% { box-shadow: 0 0 0 0 rgba(141,198,63,0.4); }
          50%  { box-shadow: 0 0 0 10px rgba(141,198,63,0); }
        }
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .green-btn {
          background: #8DC63F;
          color: #1A2B0A;
          border: none;
          cursor: pointer;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          position: relative;
          overflow: hidden;
          transition: all 0.28s ease;
        }
        .green-btn::after {
          content: '';
          position: absolute; top: 0; left: -100%;
          width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
          transform: skewX(-20deg);
          transition: left 0.5s ease;
        }
        .green-btn:hover::after { left: 160%; }
        .green-btn:hover {
          background: #7AB52E;
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(141,198,63,0.38) !important;
        }

        .nav-link {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 500;
          color: #3A5A1A; text-decoration: none;
          cursor: pointer; background: none; border: none;
          padding: 0; transition: color 0.2s;
          position: relative;
        }
        .nav-link::after {
          content: '';
          position: absolute; bottom: -3px; left: 0;
          width: 0; height: 2px;
          background: #8DC63F;
          transition: width 0.3s ease;
        }
        .nav-link:hover { color: #1A2B0A; }
        .nav-link:hover::after { width: 100%; }

        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #F7F9F2; }
        ::-webkit-scrollbar-thumb { background: #8DC63F; border-radius: 3px; }
      `}</style>

      {/* ════════════════════════════════
          1. NAVBAR
      ════════════════════════════════ */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 60px", height: 62,
        background: scrolled ? "rgba(247,249,242,0.97)" : "rgba(247,249,242,0.88)",
        backdropFilter: "blur(16px)",
        borderBottom: `1px solid ${scrolled ? "rgba(141,198,63,0.2)" : "rgba(210,225,180,0.35)"}`,
        transition: "all 0.3s ease",
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: "linear-gradient(135deg, #5A9010, #8DC63F)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 14px rgba(141,198,63,0.35)",
            animation: "pulseGreen 3s ease-in-out infinite",
          }}>
            <span style={{ fontSize: 16 }}>💪</span>
          </div>
          <span style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800, fontSize: 18,
            color: "#3A7A10",
            letterSpacing: "-0.01em",
          }}>FitIndia<span style={{ color: "#8DC63F" }}>.ai</span></span>
        </Link>

        {/* Center nav */}
        <nav style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <button className="nav-link" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Home</button>
          <div style={{ position: "relative" }}>
            <button className="nav-link" onClick={() => scrollTo("features")}>
              Feature <span style={{ fontSize: 10 }}>▾</span>
            </button>
          </div>
          <button className="nav-link" onClick={() => scrollTo("how-it-works")}>Feature</button>
          <button className="nav-link" onClick={() => scrollTo("pricing")}>Pricing</button>
          <Link to="/blog" className="nav-link" style={{ textDecoration: "none", color: "#3A5A1A" }}>Blog</Link>
        </nav>

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {isSignedIn ? (
            <>
              <button className="nav-link" onClick={() => navigate("/dashboard")}>Dashboard</button>
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <>
              <Link to="/sign-in" className="nav-link" style={{ textDecoration: "none", color: "#3A5A1A" }}>Log In</Link>
              <button
                onClick={() => navigate("/sign-up")}
                className="green-btn"
                style={{
                  padding: "9px 22px", borderRadius: 9,
                  fontSize: 14,
                  boxShadow: "0 4px 16px rgba(141,198,63,0.3)",
                }}
              >Get Started</button>
            </>
          )}
        </div>
      </header>

      {/* ════════════════════════════════
          2. HERO — full bleed image (flush with navbar)
      ════════════════════════════════ */}
      <section style={{
        position: "relative",
        width: "100%", height: "520px",
        overflow: "hidden",
        marginTop: 0,
        display: "block",
        lineHeight: 0,
      }}>
        {/* Background image */}
        <img
          src="/Gemini_Generated_Image_7gjz3u7gjz3u7gjz.png"
          alt="Runners"
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center top",
          }}
        />
        {/* Left gradient overlay so text reads cleanly */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(90deg, rgba(247,249,242,0.92) 0%, rgba(247,249,242,0.75) 42%, rgba(247,249,242,0.1) 68%, transparent 100%)",
        }} />
        {/* Bottom fade */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 100,
          background: "linear-gradient(to top, #F7F9F2, transparent)",
        }} />

        {/* Text content */}
        <div style={{
          position: "absolute", top: 0, left: 0, bottom: 0,
          width: "52%",
          display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "80px 60px 0 60px",
        }}>
          <h1 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "clamp(30px, 3.8vw, 48px)",
            fontWeight: 900,
            lineHeight: 1.15,
            color: "#1A2B0A",
            marginBottom: 18,
            animation: "slideLeft 0.85s ease both",
            letterSpacing: "-0.02em",
          }}>
            TRANSFORM YOURSELF.<br />
            REVOLUTIONIZE YOUR LIFE.<br />
            <span style={{
              background: "linear-gradient(135deg, #3A7A10 0%, #8DC63F 60%, #5A9010 100%)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "shimmer 4s linear infinite",
            }}>UNLEASH THE INNER ATHLETE.</span>
          </h1>

          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 16, color: "#3A5A1A",
            lineHeight: 1.65, marginBottom: 32,
            animation: "slideLeft 0.85s ease 0.1s both",
          }}>
            Personalized, AI-Driven Workouts and Nutrition.<br />
            Keep Fit, Stay Strong.
          </p>

          <div style={{
            display: "flex", gap: 14,
            animation: "slideLeft 0.85s ease 0.2s both",
          }}>
            <button
              onClick={() => navigate(isSignedIn ? "/dashboard" : "/sign-up")}
              className="green-btn"
              style={{
                padding: "14px 30px", borderRadius: 10,
                fontSize: 15,
                boxShadow: "0 6px 24px rgba(141,198,63,0.38)",
              }}
            >Get Started</button>
            <button
              onClick={() => scrollTo("how-it-works")}
              style={{
                padding: "14px 26px", borderRadius: 10,
                border: "1.5px solid rgba(141,198,63,0.5)",
                background: "rgba(255,255,255,0.7)",
                color: "#3A5A1A",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 15, fontWeight: 600,
                cursor: "pointer",
                backdropFilter: "blur(8px)",
                transition: "all 0.25s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(141,198,63,0.12)"; e.currentTarget.style.borderColor = "#8DC63F"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.7)"; e.currentTarget.style.borderColor = "rgba(141,198,63,0.5)"; }}
            >See How It Works</button>
          </div>

          {/* Mini stats */}
          <div style={{
            display: "flex", gap: 28, marginTop: 36,
            animation: "slideLeft 0.85s ease 0.3s both",
          }}>
            {[
              { v: 50000, s: "+", l: "Active Users" },
              { v: 200,   s: "+", l: "Workout Plans" },
              { v: 98,    s: "%", l: "Satisfaction" },
            ].map(({ v, s, l }) => (
              <div key={l}>
                <div style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 22, fontWeight: 800,
                  color: "#3A7A10", lineHeight: 1,
                }}>
                  <Counter end={v} suffix={s} />
                </div>
                <div style={{ fontSize: 11, color: "#7A9A5A", letterSpacing: "0.08em", marginTop: 3 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          3. HOW IT WORKS
      ════════════════════════════════ */}
      <section id="how-it-works" style={{ padding: "88px 60px", background: "#F7F9F2" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{
            display: "inline-block",
            padding: "5px 16px",
            background: "rgba(141,198,63,0.12)",
            border: "1px solid rgba(141,198,63,0.3)",
            borderRadius: 99, marginBottom: 16,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12, fontWeight: 600,
            color: "#5A8A20", letterSpacing: "0.1em",
          }}>SIMPLE 4-STEP PROCESS</div>
          <h2 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "clamp(28px, 3.5vw, 44px)",
            fontWeight: 900, color: "#1A2B0A",
            letterSpacing: "-0.02em",
            animation: "fadeUp 0.7s ease both",
          }}>How It Works</h2>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 16, color: "#667755",
            maxWidth: 500, margin: "12px auto 0",
            animation: "fadeUp 0.7s ease 0.1s both",
          }}>
            From goal-setting to real results — your AI coach guides every step.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 20,
          maxWidth: 1200, margin: "0 auto",
        }}>
          <StepCard
            num={1} delay={0}
            icon="🎯"
            title="Set Your Goals"
            desc="Tell us what you want to achieve — weight loss, muscle gain, endurance, or overall fitness. Our AI tailors everything to your specific targets and timeline."
          />
          <StepCard
            num={2} delay={100}
            icon="🧬"
            title="Personalization"
            desc="We analyze your body metrics, fitness level, dietary preferences, and schedule to build a 100% personalized plan — no cookie-cutter programs."
          />
          <StepCard
            num={3} delay={200}
            icon="🤖"
            title="AI Workout"
            desc="Get science-backed workouts powered by our AI engine. Exercises adapt in real-time based on your performance, fatigue, and recovery signals."
          />
          <StepCard
            num={4} delay={300}
            icon="📊"
            title="Track Progress"
            desc="Visual dashboards, rep counters, calorie logs, and weekly reports keep you accountable. Our AI adjusts your plan as you grow stronger."
          />
        </div>

        {/* Connector arrows */}
        <div style={{
          display: "flex", justifyContent: "center",
          gap: 0, marginTop: 32,
          maxWidth: 1200, margin: "32px auto 0",
        }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              flex: 1, display: "flex", alignItems: "center",
              justifyContent: "center",
              fontSize: 22, color: "rgba(141,198,63,0.5)",
            }}>→</div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════
          3b. REAL-TIME BODY ANALYTICS
          (matches screenshot 2 — light pinkish-cream bg,
           text left, image right with BPM badge)
      ════════════════════════════════ */}
      <section style={{
        padding: "88px 60px",
        background: "linear-gradient(135deg, #F5F0EE 0%, #EDE8E4 50%, #F0EBE8 100%)",
        position: "relative", overflow: "hidden",
      }}>
        {/* Warm blob top-right */}
        <div style={{
          position: "absolute", top: "-20%", right: "-8%",
          width: "55%", height: "140%",
          background: "radial-gradient(ellipse at 65% 45%, rgba(210,125,105,0.18) 0%, rgba(190,88,75,0.09) 45%, transparent 70%)",
          borderRadius: "50% 50% 50% 50%",
          pointerEvents: "none",
        }} />

        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 64, alignItems: "center",
          maxWidth: 1200, margin: "0 auto",
          position: "relative", zIndex: 2,
        }}>
          {/* Left — text */}
          <div>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11, fontWeight: 700,
              color: "#8B3A2A", letterSpacing: "0.18em",
              marginBottom: 18, textTransform: "uppercase",
            }}>AI-POWERED TRACKING</p>
            <h2 style={{
              fontFamily: "'Playfair Display', 'Georgia', serif",
              fontSize: "clamp(32px, 4vw, 52px)",
              fontWeight: 900, lineHeight: 1.1,
              color: "#1A0808", marginBottom: 20,
              letterSpacing: "-0.015em",
            }}>
              Real-Time<br />Body Analytics
            </h2>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 15, color: "#6B5050",
              lineHeight: 1.78, maxWidth: 400, marginBottom: 36,
            }}>
              Our AI track your form, monitors vital metrics and provides feedback during every workout — just like being a personal trainer.
            </p>

            {/* 4 metric chips */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr",
              gap: 12, maxWidth: 380,
            }}>
              {[
                { val: "Real-time", sub: "Pose Detection" },
                { val: "Auto",      sub: "Rep Counting" },
                { val: "0-100",     sub: "Form Score" },
                { val: "Live",      sub: "Calories" },
              ].map(({ val, sub }) => (
                <div key={sub} style={{
                  padding: "14px 16px",
                  background: "rgba(255,255,255,0.7)",
                  border: "1px solid rgba(180,160,155,0.35)",
                  borderRadius: 12,
                  backdropFilter: "blur(8px)",
                  cursor: "default",
                  transition: "all 0.22s ease",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.95)"; e.currentTarget.style.borderColor = "rgba(139,58,42,0.3)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.7)"; e.currentTarget.style.borderColor = "rgba(180,160,155,0.35)"; }}
                >
                  <div style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 15, fontWeight: 800,
                    color: "#8B3A2A", marginBottom: 3,
                  }}>{val}</div>
                  <div style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 12, color: "#9A8888",
                  }}>{sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — image with badges */}
          <div style={{ position: "relative" }}>
            <div style={{
              borderRadius: 18, overflow: "hidden",
              border: "1px solid rgba(139,58,42,0.1)",
              boxShadow: "0 24px 64px rgba(100,40,30,0.18)",
            }}>
              <img
                src="/data-stats-around-person-doing-physical-activity.jpg"
                alt="Body Analytics"
                style={{
                  width: "100%", height: 360,
                  objectFit: "cover", display: "block",
                }}
              />
            </div>

            {/* BPM badge top-right */}
            <div style={{
              position: "absolute", top: 14, right: 14,
              background: "rgba(15,8,8,0.92)",
              borderRadius: 10, padding: "10px 16px",
              border: "1px solid rgba(139,58,42,0.3)",
              backdropFilter: "blur(12px)",
              textAlign: "center",
              boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
            }}>
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 28, fontWeight: 900, color: "#fff", lineHeight: 1,
              }}>129</div>
              <div style={{ fontSize: 9, color: "#888", letterSpacing: "0.1em", marginTop: 2 }}>BPM</div>
            </div>

            {/* "Fit India" label bottom */}
            <div style={{
              position: "absolute", bottom: 14, left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(139,58,42,0.9)",
              borderRadius: 8, padding: "6px 18px",
              backdropFilter: "blur(8px)",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11, fontWeight: 700, color: "#fff",
              letterSpacing: "0.1em", whiteSpace: "nowrap",
              boxShadow: "0 4px 16px rgba(139,58,42,0.3)",
            }}>Fit India</div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          3c. EVERY REP. PERFECTLY TRACKED.
          (matches screenshot 3 — image left, text right)
      ════════════════════════════════ */}
      <section style={{
        padding: "88px 60px",
        background: "linear-gradient(135deg, #EDE8E4 0%, #F0EBE8 60%, #E8E0DC 100%)",
        position: "relative", overflow: "hidden",
      }}>
        {/* Warm blob bottom-left */}
        <div style={{
          position: "absolute", bottom: "-20%", left: "-8%",
          width: "50%", height: "130%",
          background: "radial-gradient(ellipse at 30% 65%, rgba(200,105,85,0.15) 0%, transparent 65%)",
          borderRadius: "50%",
          pointerEvents: "none",
        }} />

        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 64, alignItems: "center",
          maxWidth: 1200, margin: "0 auto",
          position: "relative", zIndex: 2,
        }}>
          {/* Left — image with overlay bar */}
          <div style={{ position: "relative" }}>
            <div style={{
              borderRadius: 18, overflow: "hidden",
              border: "1px solid rgba(139,58,42,0.1)",
              boxShadow: "0 24px 64px rgba(100,40,30,0.18)",
            }}>
              <img
                src="/full-shot-man-doing-sport-with-stats.jpg"
                alt="Intelligent Coaching"
                style={{
                  width: "100%", height: 360,
                  objectFit: "cover", display: "block",
                }}
              />
            </div>

            {/* Bottom caption bar */}
            <div style={{
              position: "absolute", bottom: 14, left: 14, right: 14,
              background: "rgba(10,5,5,0.9)",
              borderRadius: 10, padding: "11px 16px",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(139,58,42,0.25)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
            }}>
              <div style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 11, fontWeight: 700,
                color: "#a8e8a8", marginBottom: 4,
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <span style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: "#4ADE80", display: "inline-block",
                  boxShadow: "0 0 6px #4ADE80",
                }} />
                The Back — Best Calories Loss
              </div>
              <div style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 11, color: "#666",
              }}>X91 body 8dy · 31T mumble woun · Casct cato: 175 bpm</div>
            </div>
          </div>

          {/* Right — text */}
          <div>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11, fontWeight: 700,
              color: "#8B3A2A", letterSpacing: "0.18em",
              marginBottom: 18, textTransform: "uppercase",
            }}>INTELLIGENT COACHING</p>
            <h2 style={{
              fontFamily: "'Playfair Display', 'Georgia', serif",
              fontSize: "clamp(32px, 4vw, 56px)",
              fontWeight: 900, lineHeight: 1.08,
              marginBottom: 22, letterSpacing: "-0.015em",
            }}>
              <span style={{ color: "#1A0808" }}>Every Rep.<br /></span>
              <span style={{
                background: "linear-gradient(135deg, #6B0A1A 0%, #A52535 60%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>Perfectly Tracked.</span>
            </h2>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 15, color: "#6B5050",
              lineHeight: 1.78, maxWidth: 400, marginBottom: 36,
            }}>
              Advanced computer vision analyse your movement patterns and gives science-backed feedback to maximize results and prevent injury.
            </p>
            <button
              onClick={() => navigate(isSignedIn ? "/workout" : "/sign-up")}
              style={{
                padding: "14px 32px", borderRadius: 10,
                background: "linear-gradient(135deg, #6B0A1A, #8B1A2B)",
                border: "none", color: "#fff",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 15, fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 6px 24px rgba(139,26,43,0.35)",
                transition: "all 0.25s ease",
                letterSpacing: "0.02em",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 36px rgba(139,26,43,0.5)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(139,26,43,0.35)"; }}
            >Start Training →</button>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          4. WHY FITINDIA.AI?
      ════════════════════════════════ */}
      <section id="features" style={{
        padding: "88px 60px",
        background: "linear-gradient(160deg, #1A2B0A 0%, #243810 40%, #1A3008 100%)",
        position: "relative", overflow: "hidden",
      }}>
        {/* Subtle texture */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "radial-gradient(circle at 20% 30%, rgba(141,198,63,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(141,198,63,0.06) 0%, transparent 50%)",
        }} />

        <div style={{ textAlign: "center", marginBottom: 52, position: "relative", zIndex: 2 }}>
          <div style={{
            display: "inline-block",
            padding: "5px 16px",
            background: "rgba(141,198,63,0.15)",
            border: "1px solid rgba(141,198,63,0.3)",
            borderRadius: 99, marginBottom: 16,
            fontSize: 12, fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
            color: "#A8D870", letterSpacing: "0.1em",
          }}>OUR ADVANTAGES</div>
          <h2 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "clamp(28px, 3.5vw, 44px)",
            fontWeight: 900, color: "#E8F5C8",
            letterSpacing: "-0.02em",
            animation: "fadeUp 0.7s ease both",
          }}>Why FitIndia.ai?</h2>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 16, color: "rgba(200,230,150,0.65)",
            maxWidth: 480, margin: "12px auto 0",
          }}>
            India's first truly intelligent fitness companion — built for Indian bodies, lifestyles, and goals.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 20,
          maxWidth: 1100, margin: "0 auto",
          position: "relative", zIndex: 2,
        }}>
          <WhyCard delay={0}   icon="🤖" title="AI Analysis"
            desc="Personalized to exactly our enterprise AI analysing deeper self-realization of all humans." />
          <WhyCard delay={80}  icon="🥗" title="Adaptive Nutrition"
            desc="Recommends ingredients from local cuisine with seasonal nutrition that adapts repetition." />
          <WhyCard delay={160} icon="📈" title="Progress Tracking"
            desc="Continuous updates always progress toward achieving metrics and continuous improvements." />
          <WhyCard delay={240} icon="🧠" title="AI Strategies"
            desc="Response to provide more more connoted and depersonalized-able stamina achievements." />
          <WhyCard delay={320} icon="🏋️" title="Training Proving"
            desc="Summarize to estimate more plans cuttable breadth-raising metabolisms." />
          <WhyCard delay={400} icon="🔄" title="Reset Tracking"
            desc="Proactively anticipates a diversal setup rag intuitional to wellness of progress finturnings." />
        </div>

        <div style={{ textAlign: "center", marginTop: 44, position: "relative", zIndex: 2 }}>
          <button
            onClick={() => scrollTo("features")}
            className="green-btn"
            style={{
              padding: "13px 32px", borderRadius: 10,
              fontSize: 15,
              boxShadow: "0 6px 24px rgba(141,198,63,0.3)",
            }}
          >Feature Gallery</button>
        </div>
      </section>

      {/* ════════════════════════════════
          5. PRICING
      ════════════════════════════════ */}
      <section id="pricing" style={{ padding: "88px 60px", background: "#F7F9F2" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{
            display: "inline-block",
            padding: "5px 16px",
            background: "rgba(141,198,63,0.12)",
            border: "1px solid rgba(141,198,63,0.3)",
            borderRadius: 99, marginBottom: 16,
            fontSize: 12, fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
            color: "#5A8A20", letterSpacing: "0.1em",
          }}>TRANSPARENT PLANS</div>
          <h2 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "clamp(28px, 3.5vw, 44px)",
            fontWeight: 900, color: "#1A2B0A",
            letterSpacing: "-0.02em",
          }}>Pricing</h2>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 16, color: "#667755",
            maxWidth: 460, margin: "12px auto 0",
          }}>No hidden charges. Cancel anytime. 7-day free trial on all plans.</p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 22,
          maxWidth: 1050, margin: "0 auto",
          alignItems: "start",
        }}>
          <PricingCard
            delay={0}
            plan="Basic"
            price="299"
            period="/month"
            desc="Most modern features for beginners"
            highlight={false}
            features={[
              "Basic Fitness Tracking",
              "Adaptive Nutrition Suggestions",
              "5 AI Workout Templates",
              "Clean Dashboard",
              "Email Support",
            ]}
            cta="Current Plan"
            onSelectPlan={handleUpgrade}
          />
          <PricingCard
            delay={100}
            plan="Pro"
            price="799"
            period="/month"
            desc="Most modern features for serious athletes"
            highlight={false}
            badge="👑 Most Popular"
            features={[
              "Adaptive AI Workout Plans",
              "Deep Pro Analysis & Insights",
              "Personal Meal Planning",
              "Progress Tracking Charts",
              "Clean Nutrition Log",
              "Elite Features Access",
              "Priority Chat Support",
            ]}
            cta="Get Started"
            onSelectPlan={handleUpgrade}
          />
          <PricingCard
            delay={200}
            plan="Elite"
            price="1499"
            period="/month"
            desc="Most modern features for champions"
            highlight={true}
            badge="🏆 Best Value"
            features={[
              "Everything in Pro",
              "Adaptive AI Personalisation",
              "Advanced Biometric Analysis",
              "Personal Macro Monitoring",
              "Real-time Program Tracking",
              "Live Session Feedback",
              "Elite Class Coaching",
              "24/7 Priority Support",
            ]}
            cta="Get Started"
            onSelectPlan={handleUpgrade}
          />
        </div>

        <p style={{
          textAlign: "center", marginTop: 28,
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13, color: "#9AAA88",
        }}>
          All prices include GST · Secure payments via Razorpay · Cancel anytime
        </p>
      </section>

      {/* ════════════════════════════════
          6. FOOTER
      ════════════════════════════════ */}
      <footer id="footer" style={{
        background: "#F0F4E8",
        borderTop: "1px solid rgba(141,198,63,0.15)",
        padding: "56px 60px 0",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr 1fr 1fr 1fr",
          gap: 40,
          maxWidth: 1200, margin: "0 auto",
          paddingBottom: 48,
        }}>
          {/* Brand */}
          <div>
            <div style={{
              display: "flex", alignItems: "center", gap: 8, marginBottom: 16,
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: "linear-gradient(135deg, #5A9010, #8DC63F)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 15,
              }}>💪</div>
              <span style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800, fontSize: 17, color: "#3A7A10",
              }}>FitIndia<span style={{ color: "#8DC63F" }}>.ai</span></span>
            </div>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14, color: "#667755",
              lineHeight: 1.7, marginBottom: 20, maxWidth: 220,
            }}>
              Helping a thousand-all teams before perfectness, understanding and fixing your soldiers.
            </p>
            <button
              onClick={() => navigate(isSignedIn ? "/dashboard" : "/sign-up")}
              className="green-btn"
              style={{
                padding: "10px 24px", borderRadius: 9,
                fontSize: 14,
                boxShadow: "0 4px 16px rgba(141,198,63,0.3)",
              }}
            >Get Started</button>
          </div>

          {/* Company */}
          <FooterCol title="Company" links={[
            { label: "Team",      to: "/about#team" },
            { label: "About",     to: "/about" },
            { label: "Careers",   to: "/careers" },
            { label: "Contact",   to: "/contact" },
            { label: "Tacos",     to: "/blog" },
          ]} />

          {/* About */}
          <FooterCol title="About" links={[
            { label: "Doctors",        to: "/about#doctors" },
            { label: "Accessibility",  to: "/about#accessibility" },
            { label: "Institutes",     to: "/about#institutes" },
            { label: "Sitemap",        to: "/sitemap" },
            { label: "Security Policy",to: "/security" },
          ]} />

          {/* Footer */}
          <FooterCol title="Footer" links={[
            { label: "Content",       to: "/content" },
            { label: "Tutorials",     to: "/tutorials" },
            { label: "Contact Us",    to: "/contact" },
            { label: "Privacy Policy",to: "/privacy" },
          ]} />

          {/* Noise / Social */}
          <div>
            <p style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 13, fontWeight: 700,
              color: "#1A2B0A", marginBottom: 16,
              letterSpacing: "0.04em",
            }}>Noise</p>
            <div style={{ display: "flex", gap: 10 }}>
              {[
                { icon: "𝕏", label: "Twitter" },
                { icon: "in", label: "LinkedIn" },
                { icon: "▶", label: "YouTube" },
                { icon: "📸", label: "Instagram" },
              ].map(({ icon, label }) => (
                <a
                  key={label}
                  href="#"
                  title={label}
                  style={{
                    width: 34, height: 34, borderRadius: 8,
                    background: "rgba(141,198,63,0.1)",
                    border: "1px solid rgba(141,198,63,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, color: "#5A8A20",
                    textDecoration: "none",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#8DC63F"; e.currentTarget.style.color = "#1A2B0A"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(141,198,63,0.1)"; e.currentTarget.style.color = "#5A8A20"; }}
                >{icon}</a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: "1px solid rgba(141,198,63,0.15)",
          padding: "18px 0",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          maxWidth: 1200, margin: "0 auto",
        }}>
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13, color: "#9AAA88",
          }}>
            Copyright © 2026 — FitIndia.ai
          </span>
          <Link to="/privacy" style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13, color: "#9AAA88", textDecoration: "none",
            transition: "color 0.2s",
          }}
            onMouseEnter={e => e.target.style.color = "#5A8A20"}
            onMouseLeave={e => e.target.style.color = "#9AAA88"}
          >Notice</Link>
        </div>
      </footer>
    </div>
  );
};

/* ── Footer column helper ── */
const FooterCol = ({ title, links }) => (
  <div>
    <p style={{
      fontFamily: "'Syne', sans-serif",
      fontSize: 13, fontWeight: 700,
      color: "#1A2B0A", marginBottom: 16,
      letterSpacing: "0.04em",
    }}>{title}</p>
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {links.map(({ label, to }) => (
        <Link
          key={label}
          to={to}
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14, color: "#667755",
            textDecoration: "none", transition: "color 0.2s",
          }}
          onMouseEnter={e => e.target.style.color = "#3A7A10"}
          onMouseLeave={e => e.target.style.color = "#667755"}
        >{label}</Link>
      ))}
    </div>
  </div>
);

export default Home;