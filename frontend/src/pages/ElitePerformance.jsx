// frontend/src/pages/ElitePerformance.jsx
import React, { useState, useEffect } from "react";

const ElitePerformance = () => {
  // --- Strava States ---
  const [activity, setActivity] = useState({ type: "Run", distance: "5", duration: "25", elevation: "40" });
  const [shoeMileage, setShoeMileage] = useState(350); // in km
  const [shoes] = useState({ brand: "Nike Pegasus 40", limit: 800 });

  // --- Apple States ---
  const [rings, setRings] = useState({ move: 320, exercise: 22, stand: 8 }); // Stand will double as hydration glasses
  const [trophies, setTrophies] = useState({
    hydrationChamp: false,
    speedDemon: false,
    ironLifter: false,
    sleepMaster: false,
    streakGold: false,
    formExpert: false,
    centuryClub: false,
    activeRest: false
  });

  // --- Fitbit States ---
  const [sleep, setSleep] = useState({ bedTime: "22:30", wakeTime: "06:30" });
  const [hydration, setHydration] = useState(1.2); // in Liters
  const [stress, setStress] = useState(4); // 1 to 10

  // --- PUSH States ---
  const [pushLift, setPushLift] = useState({ exercise: "Bench Press", weight: "80", reps: "5", velocity: "0.65" });

  // Handle Hydration Fluid Glass Cup Click
  const handleDrinkWater = () => {
    setHydration(prev => {
      const next = parseFloat((prev + 0.25).toFixed(2));
      if (next >= 2.5) {
        setTrophies(t => ({ ...t, hydrationChamp: true }));
      }
      return next;
    });
    setRings(r => ({ ...r, stand: Math.min(12, r.stand + 1) }));
  };

  // Strava Calculations
  const calculatedPace = () => {
    const dist = parseFloat(activity.distance);
    const dur = parseFloat(activity.duration);
    if (!dist || !dur) return "--";
    const totalSecs = dur * 60;
    const paceSecsPerKm = totalSecs / dist;
    const mins = Math.floor(paceSecsPerKm / 60);
    const secs = Math.round(paceSecsPerKm % 60);
    return `${mins}:${secs.toString().padStart(2, "0")} /km`;
  };

  const calculatedSpeed = () => {
    const dist = parseFloat(activity.distance);
    const dur = parseFloat(activity.duration);
    if (!dist || !dur) return "--";
    return ((dist / (dur / 60))).toFixed(1);
  };

  const calculatedMETCalories = () => {
    const dist = parseFloat(activity.distance);
    const dur = parseFloat(activity.duration);
    if (!dist || !dur) return "--";
    // Approx 1 MET is 1 kcal/kg/hour. Running is approx 9.8 METs.
    return Math.round(9.8 * 70 * (dur / 60));
  };

  // Fitbit Calculations
  const calculatedSleepScore = () => {
    const [bh, bm] = sleep.bedTime.split(":").map(Number);
    const [wh, wm] = sleep.wakeTime.split(":").map(Number);
    let diffMins = (wh * 60 + wm) - (bh * 60 + bm);
    if (diffMins < 0) diffMins += 24 * 60; // Over midnight
    const hours = diffMins / 60;
    const score = Math.min(100, Math.round((hours / 8) * 90 + (score => score > 80 ? 10 : 0)));
    return { hours: hours.toFixed(1), score };
  };

  // PUSH VBT Calculations
  const calculatedPushMetrics = () => {
    const wt = parseFloat(pushLift.weight);
    const rp = parseFloat(pushLift.reps);
    const vel = parseFloat(pushLift.velocity);
    if (!wt || !rp || !vel) return { power: "--", rm1: "--", zone: "--" };

    // Force = mass * acceleration (acceleration ~ 9.81 m/s^2)
    // Power (Watts) = Force (Newtons) * Velocity (m/s)
    const power = Math.round((wt * 9.81) * vel);

    // Epley 1RM Estimate: Weight * (1 + reps/30)
    const rm1 = Math.round(wt * (1 + rp / 30));

    // VBT Zone Classification
    let zone = "Max Strength";
    if (vel > 1.0) zone = "Starting Strength";
    else if (vel > 0.75) zone = "Speed-Strength";
    else if (vel > 0.5) zone = "Strength-Speed";
    else if (vel > 0.15) zone = "Accelerated Strength";

    return { power, rm1, zone };
  };

  // Unlock Trophies Check on load
  useEffect(() => {
    const { rm1, power } = calculatedPushMetrics();
    const pace = calculatedPace();
    if (rm1 !== "--" && parseFloat(rm1) >= 100) {
      setTrophies(t => ({ ...t, ironLifter: true }));
    }
    if (calculatedSleepScore().score >= 85) {
      setTrophies(t => ({ ...t, sleepMaster: true }));
    }
  }, [pushLift, sleep]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #020617 0%, #0f172a 50%, #0a0f1e 100%)",
      padding: "36px 24px 64px",
      fontFamily: "'DM Sans', system-ui, sans-serif",
      color: "#f1f5f9",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes floatCup { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        .elite-card {
          background: rgba(15,23,42,0.65);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          border: 1px solid rgba(141,198,63,0.15);
          box-shadow: 0 20px 50px rgba(0,0,0,0.4);
          padding: 28px;
          animation: slideUp 0.6s ease both;
        }
        .elite-input {
          width: 100%;
          background: rgba(2,6,23,0.7);
          border: 1px solid rgba(141,198,63,0.2);
          border-radius: 12px;
          padding: 10px 12px;
          color: #f1f5f9;
          font-size: 13px;
          outline: none;
          box-sizing: border-box;
          transition: all 0.25s ease;
        }
        .elite-input:focus {
          border-color: #8DC63F;
          box-shadow: 0 0 8px rgba(141,198,63,0.25);
        }
        .trophy-badge {
          background: rgba(2,6,23,0.5);
          border: 1px solid rgba(255,255,255,0.04);
          border-radius: 16px;
          padding: 14px;
          text-align: center;
          transition: all 0.3s;
          cursor: pointer;
        }
        .trophy-badge.unlocked {
          border-color: rgba(251,146,60,0.35);
          box-shadow: 0 0 16px rgba(251,146,60,0.15);
          background: rgba(251,146,60,0.06);
        }
      `}</style>

      <div style={{ width: "100%", maxWidth: 1100 }}>
        {/* Header Title */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "5px 14px", borderRadius: 999,
            background: "rgba(141,198,63,0.1)",
            border: "1px solid rgba(141,198,63,0.25)",
            fontSize: 11, fontWeight: 700, color: "#8DC63F",
            letterSpacing: "0.1em", marginBottom: 16,
          }}>
            👑 FITINDIA PRO ELITE LAB
          </div>
          <h1 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "clamp(32px, 5vw, 44px)",
            fontWeight: 900, margin: 0, lineHeight: 1.1,
            letterSpacing: "-0.02em",
          }}>
            Advanced Performance <span style={{
              background: "linear-gradient(135deg, #8DC63F 0%, #22d3ee 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
            }}>Athletic Suite</span>
          </h1>
          <p style={{ fontSize: 15, color: "#64748b", marginTop: 8, fontWeight: 500 }}>
            Compare, analyze, and track your active performance parameters modeled after Apple, Strava, Fitbit, and PUSH.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))", gap: 28, marginBottom: 40 }}>
          
          {/* 1. APPLE RINGS & TROPHIES CABINET */}
          <div className="elite-card" style={{ animationDelay: "0s" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: "#22d3ee" }}>⌚ Apple Rings & Trophies</span>
              <span style={{ fontSize: 10, background: "rgba(34,211,238,0.12)", color: "#22d3ee", padding: "3px 8px", borderRadius: 99, fontWeight: 700 }}>LIVE CABINET</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "170px 1fr", gap: 24, alignItems: "center", marginBottom: 28 }}>
              {/* Concentric SVG Rings */}
              <div style={{ display: "flex", justifyContent: "center", position: "relative" }}>
                <svg width="150" height="150" viewBox="0 0 150 150" style={{ transform: "rotate(-90deg)" }}>
                  {/* Outer Ring: Move (Red) */}
                  <circle cx="75" cy="75" r="60" fill="none" stroke="rgba(239,68,68,0.1)" strokeWidth="11" />
                  <circle cx="75" cy="75" r="60" fill="none" stroke="#ef4444" strokeWidth="11" strokeDasharray={`${Math.min(1, rings.move / 500) * 2 * Math.PI * 60} ${2 * Math.PI * 60}`} strokeLinecap="round" />
                  
                  {/* Middle Ring: Exercise (Green) */}
                  <circle cx="75" cy="75" r="46" fill="none" stroke="rgba(34,197,94,0.1)" strokeWidth="11" />
                  <circle cx="75" cy="75" r="46" fill="none" stroke="#22c55e" strokeWidth="11" strokeDasharray={`${Math.min(1, rings.exercise / 30) * 2 * Math.PI * 46} ${2 * Math.PI * 46}`} strokeLinecap="round" />
                  
                  {/* Inner Ring: Stand/Hydration (Blue) */}
                  <circle cx="75" cy="75" r="32" fill="none" stroke="rgba(59,130,246,0.1)" strokeWidth="11" />
                  <circle cx="75" cy="75" r="32" fill="none" stroke="#3b82f6" strokeWidth="11" strokeDasharray={`${Math.min(1, rings.stand / 12) * 2 * Math.PI * 32} ${2 * Math.PI * 32}`} strokeLinecap="round" />
                </svg>
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: 22 }}>⌚</div>
              </div>

              {/* Rings Legend */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#ef4444" }}>🔴 Move (Calories)</span>
                  <span style={{ fontSize: 13, fontWeight: 800 }}>{rings.move} / 500 kcal</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#22c55e" }}>🟢 Exercise (Mins)</span>
                  <span style={{ fontSize: 13, fontWeight: 800 }}>{rings.exercise} / 30 mins</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#3b82f6" }}>🔵 Hydration (Glasses)</span>
                  <span style={{ fontSize: 13, fontWeight: 800 }}>{rings.stand} / 12 gls</span>
                </div>
              </div>
            </div>

            {/* Achievement Badges Case */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              <div className={`trophy-badge ${trophies.hydrationChamp ? "unlocked" : ""}`}>
                <div style={{ fontSize: 24 }}>💧</div>
                <div style={{ fontSize: 10, fontWeight: 800, marginTop: 4, color: trophies.hydrationChamp ? "#fb923c" : "#475569" }}>Hydration Champ</div>
              </div>
              <div className={`trophy-badge ${trophies.speedDemon ? "unlocked" : ""}`}>
                <div style={{ fontSize: 24 }}>⚡</div>
                <div style={{ fontSize: 10, fontWeight: 800, marginTop: 4, color: trophies.speedDemon ? "#fb923c" : "#475569" }}>Speed Demon</div>
              </div>
              <div className={`trophy-badge ${trophies.ironLifter ? "unlocked" : ""}`}>
                <div style={{ fontSize: 24 }}>🏋️</div>
                <div style={{ fontSize: 10, fontWeight: 800, marginTop: 4, color: trophies.ironLifter ? "#fb923c" : "#475569" }}>Iron Lifter</div>
              </div>
              <div className={`trophy-badge ${trophies.sleepMaster ? "unlocked" : ""}`}>
                <div style={{ fontSize: 24 }}>🌙</div>
                <div style={{ fontSize: 10, fontWeight: 800, marginTop: 4, color: trophies.sleepMaster ? "#fb923c" : "#475569" }}>Sleep Master</div>
              </div>
            </div>
          </div>

          {/* 2. STRAVA PACE & GEAR LAB */}
          <div className="elite-card" style={{ animationDelay: "0.1s" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: "#fb923c" }}>🏃 Strava Activity & Gear</span>
              <span style={{ fontSize: 10, background: "rgba(251,146,60,0.12)", color: "#fb923c", padding: "3px 8px", borderRadius: 99, fontWeight: 700 }}>PERFORMANCE</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", display: "block", marginBottom: 6 }}>Activity Type</label>
                <select className="elite-input" value={activity.type} onChange={e => setActivity({ ...activity, type: e.target.value })}>
                  <option value="Run">Run</option>
                  <option value="Cycle">Cycle</option>
                  <option value="Swim">Swim</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", display: "block", marginBottom: 6 }}>Distance (km)</label>
                <input className="elite-input" type="number" value={activity.distance} onChange={e => setActivity({ ...activity, distance: e.target.value })} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", display: "block", marginBottom: 6 }}>Duration (minutes)</label>
                <input className="elite-input" type="number" value={activity.duration} onChange={e => setActivity({ ...activity, duration: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", display: "block", marginBottom: 6 }}>Elevation Gain (m)</label>
                <input className="elite-input" type="number" value={activity.elevation} onChange={e => setActivity({ ...activity, elevation: e.target.value })} />
              </div>
            </div>

            {/* Calculations Display */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24, background: "rgba(2,6,23,0.4)", borderRadius: 16, padding: 16, border: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, marginBottom: 4 }}>CALCULATED PACE</div>
                <div style={{ fontSize: 14, fontWeight: 900, color: "#fb923c" }}>{calculatedPace()}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, marginBottom: 4 }}>AVG SPEED</div>
                <div style={{ fontSize: 14, fontWeight: 900, color: "#3b82f6" }}>{calculatedSpeed()} km/h</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, marginBottom: 4 }}>MET CALORIES</div>
                <div style={{ fontSize: 14, fontWeight: 900, color: "#22c55e" }}>{calculatedMETCalories()} kcal</div>
              </div>
            </div>

            {/* Gear lifespan tracker */}
            <div style={{ background: "rgba(251,146,60,0.05)", border: "1px solid rgba(251,146,60,0.15)", borderRadius: 16, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#fb923c" }}>👟 Shoe Gear Lifespan: {shoes.brand}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8" }}>{shoeMileage} / {shoes.limit} km</span>
              </div>
              <div style={{ height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden", marginBottom: 10 }}>
                <div style={{ height: "100%", width: `${(shoeMileage / shoes.limit) * 100}%`, background: "linear-gradient(to right, #fb923c, #ef4444)", borderRadius: 99 }} />
              </div>
              <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>We recommend replacing your running shoes every 800 km to protect your joints and prevent injuries.</div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))", gap: 28 }}>
          
          {/* 3. FITBIT SLEEP & HYDRATION SUITE */}
          <div className="elite-card" style={{ animationDelay: "0.2s" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: "#8DC63F" }}>🥗 Fitbit Sleep & Hydration</span>
              <span style={{ fontSize: 10, background: "rgba(141,198,63,0.12)", color: "#8DC63F", padding: "3px 8px", borderRadius: 99, fontWeight: 700 }}>WELLNESS HUB</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 140px", gap: 24, alignItems: "center" }}>
              {/* Sleep log */}
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", display: "block", marginBottom: 4 }}>Bed Time</label>
                    <input className="elite-input" type="time" value={sleep.bedTime} onChange={e => setSleep({ ...sleep, bedTime: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", display: "block", marginBottom: 4 }}>Wake Time</label>
                    <input className="elite-input" type="time" value={sleep.wakeTime} onChange={e => setSleep({ ...sleep, wakeTime: e.target.value })} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20, background: "rgba(2,6,23,0.4)", borderRadius: 16, padding: 14, border: "1px solid rgba(255,255,255,0.04)" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700 }}>SLEEP DURATION</div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: "#8DC63F" }}>{calculatedSleepScore().hours} hours</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700 }}>FITBIT SCORE</div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: "#22d3ee" }}>{calculatedSleepScore().score} / 100</div>
                  </div>
                </div>
              </div>

              {/* Animated glass water cup */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", animation: "floatCup 4s ease-in-out infinite" }}>
                <div
                  onClick={handleDrinkWater}
                  style={{
                    position: "relative",
                    width: 76,
                    height: 100,
                    border: "3.5px solid rgba(34,211,238,0.5)",
                    borderTop: "none",
                    borderRadius: "0 0 20px 20px",
                    cursor: "pointer",
                    overflow: "hidden",
                    background: "rgba(255,255,255,0.04)"
                  }}
                >
                  {/* Fluid water inside */}
                  <div style={{
                    position: "absolute",
                    bottom: 0,
                    width: "100%",
                    height: `${Math.min(100, (hydration / 2.5) * 100)}%`,
                    background: "linear-gradient(to top, #3b82f6, #60a5fa)",
                    transition: "height 0.4s ease"
                  }} />
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: 11, fontWeight: 900, color: "#fff", textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>+GLASS</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#22d3ee", marginTop: 10 }}>{hydration} / 2.5 Liters</div>
              </div>
            </div>

            {/* Stress track bar */}
            <div style={{ marginTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#94a3b8" }}>🧠 Stress Index: Level {stress}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: stress > 6 ? "#ef4444" : stress > 3 ? "#fb923c" : "#22c55e" }}>{stress > 6 ? "High Stress Alert" : stress > 3 ? "Moderate Stress" : "Optimal Calm"}</span>
              </div>
              <input type="range" min="1" max="10" value={stress} onChange={e => setStress(Number(e.target.value))} style={{ width: "100%", accentColor: "#8DC63F" }} />
            </div>
          </div>

          {/* 4. PUSH VELOCITY-BASED LIFTING LAB */}
          <div className="elite-card" style={{ animationDelay: "0.3s" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: "#a855f7" }}>🏋️ PUSH Velocity-Based Lifting</span>
              <span style={{ fontSize: 10, background: "rgba(168,85,247,0.12)", color: "#a855f7", padding: "3px 8px", borderRadius: 99, fontWeight: 700 }}>PRO ATHLETE</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", display: "block", marginBottom: 6 }}>Lift Exercise</label>
                <select className="elite-input" value={pushLift.exercise} onChange={e => setPushLift({ ...pushLift, exercise: e.target.value })}>
                  <option value="Bench Press">Bench Press</option>
                  <option value="Squat">Back Squat</option>
                  <option value="Deadlift">Deadlift</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", display: "block", marginBottom: 6 }}>Weight Lifted (kg)</label>
                <input className="elite-input" type="number" value={pushLift.weight} onChange={e => setPushLift({ ...pushLift, weight: e.target.value })} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", display: "block", marginBottom: 6 }}>Reps Completed</label>
                <input className="elite-input" type="number" value={pushLift.reps} onChange={e => setPushLift({ ...pushLift, reps: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", display: "block", marginBottom: 6 }}>Average Speed (m/s)</label>
                <input className="elite-input" type="number" step="0.05" value={pushLift.velocity} onChange={e => setPushLift({ ...pushLift, velocity: e.target.value })} />
              </div>
            </div>

            {/* Calculations Display */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, background: "rgba(2,6,23,0.4)", borderRadius: 16, padding: 16, border: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 9, color: "#64748b", fontWeight: 700, marginBottom: 4 }}>PEAK POWER</div>
                <div style={{ fontSize: 14, fontWeight: 900, color: "#a855f7" }}>{calculatedPushMetrics().power} Watts</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 9, color: "#64748b", fontWeight: 700, marginBottom: 4 }}>ESTIMATED 1RM</div>
                <div style={{ fontSize: 14, fontWeight: 900, color: "#fb923c" }}>{calculatedPushMetrics().rm1} kg</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 9, color: "#64748b", fontWeight: 700, marginBottom: 4 }}>VELOCITY ZONE</div>
                <div style={{ fontSize: 12, fontWeight: 900, color: "#22c55e" }}>{calculatedPushMetrics().zone}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElitePerformance;
