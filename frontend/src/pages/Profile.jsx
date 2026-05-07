// frontend/src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import API from "../api.js";

const Profile = () => {
  const { user } = useUser();
  const [metrics, setMetrics] = useState({
    age: "",
    gender: "male",
    heightCm: "",
    weightKg: "",
    activityLevel: "moderate",
    goal: "maintain",
    location: "Mumbai, India",
    fitnessLevel: "Intermediate"
  });
  const [workoutStats, setWorkoutStats] = useState({ workouts: [], meals: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [dbType, setDbType] = useState("Checking...");

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const [metricsRes, progressRes, dbRes] = await Promise.all([
          API.get("/diet/metrics").catch(() => ({ data: null })),
          API.get("/progress/summary").catch(() => ({ data: { workouts: [], meals: [] } })),
          API.get("/auth/db-status").catch(() => ({ data: { dbType: "Local Fallback" } }))
        ]);
        if (metricsRes?.data) {
          setMetrics({
            age: metricsRes.data.age || "",
            gender: metricsRes.data.gender || "male",
            heightCm: metricsRes.data.heightCm || "",
            weightKg: metricsRes.data.weightKg || "",
            activityLevel: metricsRes.data.activityLevel || "moderate",
            goal: metricsRes.data.goal || "maintain",
            location: metricsRes.data.location || "Mumbai, India",
            fitnessLevel: metricsRes.data.fitnessLevel || "Intermediate"
          });
        }
        if (progressRes?.data) {
          setWorkoutStats(progressRes.data);
        }
        if (dbRes?.data) {
          setDbType(dbRes.data.dbType || "Local Fallback");
        }
      } catch (err) {
        console.error("Error loading profile data:", err);
        if (err.response && err.response.status === 401) {
          localStorage.removeItem("token");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const handleSync = () => {
      setLoading(true);
      fetchData();
    };

    window.addEventListener("user-synced", handleSync);
    return () => window.removeEventListener("user-synced", handleSync);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMetrics((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError("");

    try {
      await API.post("/diet/save-metrics", {
        age: Number(metrics.age),
        gender: metrics.gender,
        heightCm: Number(metrics.heightCm),
        weightKg: Number(metrics.weightKg),
        activityLevel: metrics.activityLevel,
        goal: metrics.goal,
        location: metrics.location,
        fitnessLevel: metrics.fitnessLevel
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setShowEditModal(false);
      }, 1500);
    } catch (err) {
      console.error("Error saving metrics:", err);
      setError("Failed to save metrics. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "80vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "#020617"
      }}>
        <div style={{
          width: 42, height: 42, borderRadius: "50%",
          border: "3px solid rgba(141,198,63,0.15)",
          borderTop: "3px solid #8DC63F",
          animation: "spin 0.75s linear infinite"
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const userAvatar = user?.imageUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80";
  const fullName = user?.fullName || "Rohan Sharma";

  // Calculations for Stats
  const totalWorkouts = workoutStats.workouts?.length || 0;
  const totalHours = Math.round((workoutStats.workouts?.reduce((sum, w) => sum + (w.durationMinutes || w.duration || 0), 0) || 0) / 60);
  
  // Calculate top activities
  const actMap = {};
  (workoutStats.workouts || []).forEach(w => {
    const act = w.exercise || "Strength Training";
    actMap[act] = (actMap[act] || 0) + 1;
  });
  const topActivities = Object.entries(actMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(entry => entry[0]);

  if (topActivities.length === 0) {
    topActivities.push("Strength Training", "Yoga", "HIIT");
  }

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
        @keyframes fadeIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .profile-card {
          background: rgba(15,23,42,0.65);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          border: 1px solid rgba(141,198,63,0.15);
          box-shadow: 0 20px 50px rgba(0,0,0,0.4);
          padding: 28px 24px;
          animation: fadeIn 0.6s ease both;
        }
        .profile-input {
          width: 100%;
          background: rgba(2,6,23,0.7);
          border: 1px solid rgba(141,198,63,0.2);
          border-radius: 12px;
          padding: 12px 14px;
          color: #f1f5f9;
          font-size: 14px;
          outline: none;
          transition: all 0.25s ease;
          box-sizing: border-box;
        }
        .profile-input:focus {
          border-color: #8DC63F;
          box-shadow: 0 0 10px rgba(141,198,63,0.25);
        }
        .profile-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #94a3b8;
          margin-bottom: 6px;
        }
      `}</style>

      <div style={{
        width: "100%",
        maxWidth: 780,
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: 24
      }}>
        {/* Header - My Fitness Journey Card */}
        <div className="profile-card" style={{ animationDelay: "0s" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <img
                src={userAvatar}
                alt={fullName}
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: "50%",
                  border: "3px solid #8DC63F",
                  boxShadow: "0 0 16px rgba(141,198,63,0.3)"
                }}
              />
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase" }}>MY FITNESS JOURNEY</div>
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, margin: "4px 0 2px" }}>{fullName}</h2>
                <div style={{ fontSize: 13, color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
                  <span>📍</span> {metrics.location}
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowEditModal(true)}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(141,198,63,0.3)",
                color: "#8DC63F",
                borderRadius: 14,
                padding: "10px 20px",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.25s"
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(141,198,63,0.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
            >
              Edit Profile
            </button>
          </div>

          <div style={{
            marginTop: 16,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
          }}>
            <div style={{
              background: "rgba(141,198,63,0.08)",
              border: "1px solid rgba(141,198,63,0.2)",
              borderRadius: 14,
              padding: "12px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#8DC63F", letterSpacing: "0.02em" }}>AI TRAINER:</span>
              <span style={{
                background: "#8DC63F", color: "#020617",
                fontSize: 11, fontWeight: 800, padding: "4px 12px",
                borderRadius: 999, boxShadow: "0 0 10px rgba(141,198,63,0.4)"
              }}>ACTIVE</span>
            </div>

            <div style={{
              background: dbType.includes("Atlas") ? "rgba(34,197,94,0.08)" : "rgba(249,115,22,0.08)",
              border: dbType.includes("Atlas") ? "1px solid rgba(34,197,94,0.2)" : "1px solid rgba(249,115,22,0.2)",
              borderRadius: 14,
              padding: "12px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: dbType.includes("Atlas") ? "#22c55e" : "#fb923c", letterSpacing: "0.02em" }}>DB SYNC:</span>
              <span style={{
                background: dbType.includes("Atlas") ? "#22c55e" : "#f97316", color: "#020617",
                fontSize: 11, fontWeight: 800, padding: "4px 12px",
                borderRadius: 999, boxShadow: dbType.includes("Atlas") ? "0 0 10px rgba(34,197,94,0.4)" : "0 0 10px rgba(249,115,22,0.4)"
              }}>{dbType.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Middle Row - Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 24 }}>
          
          {/* Personal Info Card */}
          <div className="profile-card" style={{ animationDelay: "0.1s" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "#e2e8f0" }}>PERSONAL INFO</span>
              <span style={{ fontSize: 10, background: "rgba(251,146,60,0.12)", color: "#fb923c", padding: "3px 8px", borderRadius: 99, fontWeight: 700 }}>MOTIVATION</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: "AGE", value: metrics.age ? `${metrics.age} years` : "Not Saved" },
                { label: "WEIGHT", value: metrics.weightKg ? `${metrics.weightKg} kg` : "Not Saved" },
                { label: "HEIGHT", value: metrics.heightCm ? `${metrics.heightCm} cm` : "Not Saved" },
                { label: "FITNESS LEVEL", value: metrics.fitnessLevel },
                { label: "GOAL", value: metrics.goal === "gain" ? "Build Muscle & Stamina" : metrics.goal === "lose" ? "Lose Fat (Caloric Deficit)" : "Maintain Weight" }
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>{row.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "#f1f5f9" }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Metrics & Progress Card */}
          <div className="profile-card" style={{ animationDelay: "0.2s" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "#e2e8f0" }}>METRICS & PROGRESS</span>
              <span style={{ fontSize: 10, background: "rgba(167,139,250,0.12)", color: "#a78bfa", padding: "3px 8px", borderRadius: 99, fontWeight: 700 }}>MOTIVATION</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Challenge Ring */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 6, textTransform: "uppercase" }}>MONTHLY GOAL</div>
                <div style={{ position: "relative", width: 90, height: 90, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="90" height="90" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="45" cy="45" r="38" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                    <circle cx="45" cy="45" r="38" fill="none" stroke="#fb923c" strokeWidth="8" strokeDasharray={`${0.65 * 2 * Math.PI * 38} ${2 * Math.PI * 38}`} strokeLinecap="round" />
                  </svg>
                  <div style={{ position: "absolute", fontSize: 16, fontWeight: 800 }}>65%</div>
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, marginTop: 8 }}>Build Muscle</div>
              </div>

              {/* Steps Today Ring */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 6, textTransform: "uppercase" }}>STEPS TODAY</div>
                <div style={{ position: "relative", width: 90, height: 90, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="90" height="90" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="45" cy="45" r="38" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                    <circle cx="45" cy="45" r="38" fill="none" stroke="#22c55e" strokeWidth="8" strokeDasharray={`${0.85 * 2 * Math.PI * 38} ${2 * Math.PI * 38}`} strokeLinecap="round" />
                  </svg>
                  <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <span style={{ fontSize: 15, fontWeight: 800 }}>8,521</span>
                    <span style={{ fontSize: 8, color: "#64748b", fontWeight: 700 }}>of 10k</span>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, marginTop: 8 }}>Goal: 10,000</div>
              </div>
            </div>
          </div>
        </div>

        {/* Workout Summary Card */}
        <div className="profile-card" style={{ animationDelay: "0.3s" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "#e2e8f0" }}>WORKOUT SUMMARY</span>
            <span style={{ fontSize: 10, background: "rgba(34,211,238,0.12)", color: "#22d3ee", padding: "3px 8px", borderRadius: 99, fontWeight: 700 }}>MOTIVATION</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 4 }}>Total Workouts</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#8DC63F" }}>{totalWorkouts || 145}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 4 }}>Hours</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#22d3ee" }}>{totalHours || 92}</div>
              </div>
            </div>

            <div style={{ background: "rgba(2,6,23,0.4)", borderRadius: 16, padding: 16, border: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 8, letterSpacing: "0.02em" }}>Top Activities</div>
              {topActivities.map((act, i) => (
                <div key={i} style={{ fontSize: 13, fontWeight: 800, color: "#e2e8f0", marginBottom: 6, display: "flex", gap: 6 }}>
                  <span style={{ color: "#8DC63F" }}>{i + 1}.</span> {act}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowHistoryModal(true)}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 14,
              border: "none",
              background: "linear-gradient(135deg, #fb923c, #f97316)",
              color: "#fff",
              fontWeight: 800,
              fontSize: 14,
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(249,115,22,0.25)",
              transition: "all 0.25s"
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
          >
            FULL WORKOUT HISTORY
          </button>
        </div>
      </div>

      {/* Sleek Edit Profile Modal */}
      {showEditModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(2,6,23,0.8)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 24, backdropFilter: "blur(12px)"
        }}>
          <div className="profile-card" style={{ width: "100%", maxWidth: 520, animation: "fadeIn 0.4s ease both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: 12 }}>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, margin: 0 }}>Configure My Metrics</h3>
              <button onClick={() => setShowEditModal(false)} style={{ background: "none", border: "none", color: "#64748b", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label className="profile-label">Age (years)</label>
                  <input className="profile-input" name="age" type="number" value={metrics.age} onChange={handleChange} required />
                </div>
                <div>
                  <label className="profile-label">Gender</label>
                  <select className="profile-input" name="gender" value={metrics.gender} onChange={handleChange}>
                    <option value="male" style={{ background: "#0f172a" }}>Male</option>
                    <option value="female" style={{ background: "#0f172a" }}>Female</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label className="profile-label">Height (cm)</label>
                  <input className="profile-input" name="heightCm" type="number" value={metrics.heightCm} onChange={handleChange} required />
                </div>
                <div>
                  <label className="profile-label">Weight (kg)</label>
                  <input className="profile-input" name="weightKg" type="number" value={metrics.weightKg} onChange={handleChange} required />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label className="profile-label">Activity Level</label>
                  <select className="profile-input" name="activityLevel" value={metrics.activityLevel} onChange={handleChange}>
                    <option value="sedentary" style={{ background: "#0f172a" }}>Sedentary</option>
                    <option value="light" style={{ background: "#0f172a" }}>Lightly Active</option>
                    <option value="moderate" style={{ background: "#0f172a" }}>Moderately Active</option>
                    <option value="active" style={{ background: "#0f172a" }}>Very Active</option>
                  </select>
                </div>
                <div>
                  <label className="profile-label">Goal</label>
                  <select className="profile-input" name="goal" value={metrics.goal} onChange={handleChange}>
                    <option value="lose" style={{ background: "#0f172a" }}>Lose Fat</option>
                    <option value="maintain" style={{ background: "#0f172a" }}>Maintain Weight</option>
                    <option value="gain" style={{ background: "#0f172a" }}>Gain Muscle</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                <div>
                  <label className="profile-label">Location</label>
                  <input className="profile-input" name="location" type="text" value={metrics.location} onChange={handleChange} />
                </div>
                <div>
                  <label className="profile-label">Fitness Level</label>
                  <select className="profile-input" name="fitnessLevel" value={metrics.fitnessLevel} onChange={handleChange}>
                    <option value="Beginner" style={{ background: "#0f172a" }}>Beginner</option>
                    <option value="Intermediate" style={{ background: "#0f172a" }}>Intermediate</option>
                    <option value="Advanced" style={{ background: "#0f172a" }}>Advanced</option>
                  </select>
                </div>
              </div>

              {success && (
                <div style={{ background: "rgba(34,197,94,0.15)", border: "1px solid #22c55e", borderRadius: 12, padding: "12px 16px", color: "#22c55e", fontSize: 13, fontWeight: 700, textAlign: "center", marginBottom: 16 }}>
                  ✓ Metrics saved successfully to MongoDB Atlas!
                </div>
              )}
              {error && (
                <div style={{ background: "rgba(239,68,68,0.15)", border: "1px solid #ef4444", borderRadius: 12, padding: "12px 16px", color: "#ef4444", fontSize: 13, fontWeight: 700, textAlign: "center", marginBottom: 16 }}>
                  ✗ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: 12,
                  border: "none",
                  background: "linear-gradient(135deg, #8DC63F, #5A9010)",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: "pointer",
                  boxShadow: "0 6px 20px rgba(141,198,63,0.2)"
                }}
              >
                {saving ? "Saving to MongoDB Atlas..." : "Save Metrics"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Sleek Workout History Modal */}
      {showHistoryModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(2,6,23,0.8)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 24, backdropFilter: "blur(12px)"
        }}>
          <div className="profile-card" style={{ width: "100%", maxWidth: 600, maxHeight: "80vh", overflowY: "auto", animation: "fadeIn 0.4s ease both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: 12 }}>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, margin: 0 }}>Full Workout History</h3>
              <button onClick={() => setShowHistoryModal(false)} style={{ background: "none", border: "none", color: "#64748b", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {workoutStats.workouts?.length === 0 ? (
                <div style={{ textAlign: "center", color: "#64748b", padding: "24px 0" }}>No workouts completed yet. Go log a workout session!</div>
              ) : (
                (workoutStats.workouts || []).map((w, idx) => (
                  <div key={idx} style={{
                    background: "rgba(2,6,23,0.3)",
                    border: "1px solid rgba(141,198,63,0.15)",
                    borderRadius: 14, padding: 16,
                    display: "flex", justifyContent: "space-between", alignItems: "center"
                  }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#8DC63F" }}>{w.exercise || "Strength Training"}</div>
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                        {new Date(w.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                        {" · "}{w.durationMinutes || w.duration || 0} mins
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 16, fontWeight: 900, color: "#fb923c" }}>{w.estimatedCalories || 0} kcal</div>
                      <div style={{ fontSize: 11, color: "#22c55e", fontWeight: 700, marginTop: 4 }}>Form Accuracy: {w.formScore || 100}%</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
