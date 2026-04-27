// frontend/src/pages/Diet.jsx
import React, { useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, RadialBarChart, RadialBar,
} from "recharts";

// ─── Calculation Engine ────────────────────────────────────────────────────
function calcBMR({ gender, weightKg, heightCm, age }) {
  if (gender === "male") return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
}

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const ACTIVITY_LABELS = {
  sedentary: "Sedentary",
  light: "Light",
  moderate: "Moderate",
  active: "Active",
  very_active: "Very Active",
};

const GOAL_LABELS = {
  lose: "Lose Fat",
  maintain: "Maintain",
  gain: "Gain Muscle",
};

const MEAL_PLANS = {
  lose: [
    {
      name: "Breakfast",
      time: "7:00 AM",
      icon: "🌅",
      color: "#f97316",
      items: ["2 boiled eggs", "1 slice whole wheat toast", "1 cup green tea", "Half grapefruit"],
      calories: 320,
    },
    {
      name: "Mid-Morning Snack",
      time: "10:30 AM",
      icon: "🍎",
      color: "#22c55e",
      items: ["1 apple", "10 almonds", "1 cup black coffee"],
      calories: 180,
    },
    {
      name: "Lunch",
      time: "1:00 PM",
      icon: "🥗",
      color: "#3b82f6",
      items: ["Grilled chicken breast 150g", "Mixed salad bowl", "1 cup dal", "1 chapati"],
      calories: 480,
    },
    {
      name: "Evening Snack",
      time: "4:30 PM",
      icon: "🥜",
      color: "#a855f7",
      items: ["Sprouts 100g", "1 cup buttermilk", "Cucumber slices"],
      calories: 160,
    },
    {
      name: "Dinner",
      time: "7:30 PM",
      icon: "🌙",
      color: "#6366f1",
      items: ["Grilled fish or paneer 120g", "Sauteed vegetables", "1 cup soup"],
      calories: 380,
    },
  ],
  maintain: [
    {
      name: "Breakfast",
      time: "7:00 AM",
      icon: "🌅",
      color: "#f97316",
      items: ["Oats with milk & nuts", "2 boiled eggs", "1 banana", "1 glass milk"],
      calories: 450,
    },
    {
      name: "Mid-Morning",
      time: "10:30 AM",
      icon: "🍎",
      color: "#22c55e",
      items: ["Mixed fruits bowl", "Handful of nuts", "1 cup green tea"],
      calories: 220,
    },
    {
      name: "Lunch",
      time: "1:00 PM",
      icon: "🍱",
      color: "#3b82f6",
      items: ["2–3 chapatis", "Dal + sabzi", "Rice 1 cup", "Salad + curd"],
      calories: 620,
    },
    {
      name: "Evening",
      time: "4:30 PM",
      icon: "🥜",
      color: "#a855f7",
      items: ["Chana chaat or sprouts", "1 fruit", "Coconut water"],
      calories: 250,
    },
    {
      name: "Dinner",
      time: "7:30 PM",
      icon: "🌙",
      color: "#6366f1",
      items: ["2 chapatis", "Paneer / dal / chicken", "Veg sabzi", "Salad"],
      calories: 520,
    },
  ],
  gain: [
    {
      name: "Breakfast",
      time: "7:00 AM",
      icon: "🌅",
      color: "#f97316",
      items: ["4 whole eggs", "3 slices whole wheat bread", "1 banana", "1 glass full-fat milk"],
      calories: 680,
    },
    {
      name: "Mid-Morning",
      time: "10:30 AM",
      icon: "💪",
      color: "#22c55e",
      items: ["Protein shake", "Handful walnuts + almonds", "1 apple"],
      calories: 380,
    },
    {
      name: "Lunch",
      time: "1:00 PM",
      icon: "🍱",
      color: "#3b82f6",
      items: ["3–4 chapatis / 2 cups rice", "Chicken 200g or paneer", "Dal", "Curd + sabzi"],
      calories: 850,
    },
    {
      name: "Pre-Workout",
      time: "4:00 PM",
      icon: "⚡",
      color: "#eab308",
      items: ["Banana + peanut butter toast", "Black coffee"],
      calories: 300,
    },
    {
      name: "Post-Workout",
      time: "6:30 PM",
      icon: "🥛",
      color: "#a855f7",
      items: ["Protein shake with milk", "2 boiled eggs"],
      calories: 350,
    },
    {
      name: "Dinner",
      time: "8:00 PM",
      icon: "🌙",
      color: "#6366f1",
      items: ["3 chapatis", "Chicken / fish 200g", "Sabzi", "Rice 1 cup"],
      calories: 720,
    },
  ],
};

const MACRO_COLORS = ["#22c55e", "#3b82f6", "#f97316"];

// ─── Sub-components ────────────────────────────────────────────────────────
const InputField = ({ label, name, value, onChange, placeholder, type = "number" }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em" }}>
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        padding: "14px 16px",
        borderRadius: 12,
        border: "1px solid rgba(148,163,184,0.15)",
        background: "rgba(15,23,42,0.6)",
        color: "#f1f5f9",
        fontSize: 15,
        fontWeight: 600,
        outline: "none",
        transition: "border-color 0.2s",
        width: "100%",
        boxSizing: "border-box",
      }}
      onFocus={(e) => (e.target.style.borderColor = "#22d3ee")}
      onBlur={(e) => (e.target.style.borderColor = "rgba(148,163,184,0.15)")}
    />
  </div>
);

const SelectField = ({ label, name, value, onChange, options }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em" }}>
      {label}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      style={{
        padding: "14px 16px",
        borderRadius: 12,
        border: "1px solid rgba(148,163,184,0.15)",
        background: "rgba(15,23,42,0.9)",
        color: "#f1f5f9",
        fontSize: 15,
        fontWeight: 600,
        outline: "none",
        cursor: "pointer",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────
const Diet = () => {
  const [metrics, setMetrics] = useState({
    age: "",
    gender: "male",
    heightCm: "",
    weightKg: "",
    activityLevel: "moderate",
    goal: "maintain",
  });
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("meals");

  const onChange = (e) =>
    setMetrics((m) => ({ ...m, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!metrics.age || !metrics.heightCm || !metrics.weightKg) {
      setError("Please fill in Age, Height and Weight.");
      return false;
    }
    if (+metrics.age <= 0 || +metrics.heightCm <= 0 || +metrics.weightKg <= 0) {
      setError("Values must be positive numbers.");
      return false;
    }
    if (+metrics.age < 10 || +metrics.age > 100) {
      setError("Please enter a valid age between 10 and 100.");
      return false;
    }
    return true;
  };

  const onGenerate = (e) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    setLoading(true);
    setTimeout(() => {
      // Calculate entirely on frontend — no backend needed
      const bmr = calcBMR({
        gender: metrics.gender,
        weightKg: +metrics.weightKg,
        heightCm: +metrics.heightCm,
        age: +metrics.age,
      });

      let tdee = bmr * ACTIVITY_MULTIPLIERS[metrics.activityLevel];
      if (metrics.goal === "lose")    tdee *= 0.80;
      if (metrics.goal === "gain")    tdee *= 1.15;

      const calories = Math.round(tdee);
      const protein  = Math.round((0.30 * calories) / 4);
      const fats     = Math.round((0.25 * calories) / 9);
      const carbs    = Math.round((calories - protein * 4 - fats * 9) / 4);

      setPlan({
        bmr: Math.round(bmr),
        calories,
        macros: { protein, fats, carbs },
        meals: MEAL_PLANS[metrics.goal],
        bmi: (+metrics.weightKg / Math.pow(+metrics.heightCm / 100, 2)).toFixed(1),
      });
      setLoading(false);
      setActiveTab("meals");
    }, 800);
  };

  const onReset = () => {
    setMetrics({ age: "", gender: "male", heightCm: "", weightKg: "", activityLevel: "moderate", goal: "maintain" });
    setPlan(null);
    setError("");
  };

  const macroData = plan
    ? [
        { name: "Protein", value: plan.macros.protein, unit: "g" },
        { name: "Carbs",   value: plan.macros.carbs,   unit: "g" },
        { name: "Fats",    value: plan.macros.fats,     unit: "g" },
      ]
    : [];

  const bmiCategory = (bmi) => {
    if (bmi < 18.5) return { label: "Underweight", color: "#3b82f6" };
    if (bmi < 25)   return { label: "Normal",       color: "#22c55e" };
    if (bmi < 30)   return { label: "Overweight",   color: "#f97316" };
    return             { label: "Obese",             color: "#ef4444" };
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)",
      padding: "32px 24px",
      fontFamily: "'DM Sans', system-ui, sans-serif",
      color: "#f1f5f9",
    }}>

      {/* ── Page Header ── */}
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "6px 16px", borderRadius: 999,
          background: "rgba(34,211,238,0.08)",
          border: "1px solid rgba(34,211,238,0.2)",
          fontSize: 12, fontWeight: 700, color: "#22d3ee",
          letterSpacing: "0.12em", textTransform: "uppercase",
          marginBottom: 16,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22d3ee", display: "inline-block", boxShadow: "0 0 8px #22d3ee" }} />
          AI Nutrition Engine
        </div>
        <h1 style={{
          fontSize: "clamp(32px, 5vw, 52px)",
          fontWeight: 900, margin: "0 0 12px",
          lineHeight: 1.1, letterSpacing: "-0.02em",
        }}>
          Your{" "}
          <span style={{
            background: "linear-gradient(135deg, #22d3ee, #3b82f6)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Personalized
          </span>{" "}
          Diet Plan
        </h1>
        <p style={{ fontSize: 16, color: "#64748b", margin: 0 }}>
          Enter your body metrics and we'll calculate your exact macros, calories, and meal plan
        </p>
      </div>

      {/* ── Form Card ── */}
      <div style={{
        maxWidth: 900, margin: "0 auto 40px",
        background: "rgba(15,23,42,0.8)",
        backdropFilter: "blur(20px)",
        borderRadius: 24, padding: 36,
        border: "1px solid rgba(148,163,184,0.1)",
        boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 28px", color: "#e2e8f0" }}>
          📋 Body Metrics
        </h2>

        <form onSubmit={onGenerate}>
          {/* Row 1 */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 16 }}>
            <InputField label="Age" name="age" value={metrics.age} onChange={onChange} placeholder="e.g. 22" />
            <SelectField
              label="Gender" name="gender" value={metrics.gender} onChange={onChange}
              options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }]}
            />
            <InputField label="Height (cm)" name="heightCm" value={metrics.heightCm} onChange={onChange} placeholder="e.g. 175" />
            <InputField label="Weight (kg)" name="weightKg" value={metrics.weightKg} onChange={onChange} placeholder="e.g. 70" />
          </div>

          {/* Row 2 */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
            <SelectField
              label="Activity Level" name="activityLevel" value={metrics.activityLevel} onChange={onChange}
              options={Object.entries(ACTIVITY_LABELS).map(([v, l]) => ({ value: v, label: l }))}
            />
            <SelectField
              label="Goal" name="goal" value={metrics.goal} onChange={onChange}
              options={Object.entries(GOAL_LABELS).map(([v, l]) => ({ value: v, label: l }))}
            />
          </div>

          {error && (
            <div style={{
              marginBottom: 20, padding: "12px 16px",
              background: "rgba(239,68,68,0.1)", borderRadius: 10,
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#fca5a5", fontSize: 14,
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "14px 32px",
                background: loading ? "rgba(34,211,238,0.3)" : "linear-gradient(135deg, #22d3ee, #3b82f6)",
                border: "none", borderRadius: 12,
                color: loading ? "#94a3b8" : "#020617",
                fontSize: 15, fontWeight: 800,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: 10,
                boxShadow: loading ? "none" : "0 8px 24px rgba(34,211,238,0.3)",
                transition: "all 0.2s",
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: 18, height: 18, borderRadius: "50%",
                    border: "2px solid rgba(148,163,184,0.3)",
                    borderTopColor: "#94a3b8",
                    animation: "spin 0.8s linear infinite",
                  }} />
                  Calculating...
                </>
              ) : (
                "⚡ Generate My Plan"
              )}
            </button>

            {plan && (
              <button
                type="button"
                onClick={onReset}
                style={{
                  padding: "14px 24px", borderRadius: 12,
                  border: "1px solid rgba(148,163,184,0.2)",
                  background: "transparent", color: "#94a3b8",
                  fontSize: 15, fontWeight: 600, cursor: "pointer",
                }}
              >
                Reset
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ── Results ── */}
      {plan && (
        <div style={{ maxWidth: 1100, margin: "0 auto", animation: "fadeUp 0.5s ease" }}>

          {/* ── Stats Row ── */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16, marginBottom: 32,
          }}>
            {[
              { label: "Daily Calories",  value: plan.calories,        unit: "kcal", color: "#f97316", icon: "🔥" },
              { label: "BMR",             value: plan.bmr,             unit: "kcal", color: "#22d3ee", icon: "💓" },
              { label: "Protein",         value: plan.macros.protein,  unit: "g",    color: "#22c55e", icon: "💪" },
              { label: "Carbohydrates",   value: plan.macros.carbs,    unit: "g",    color: "#3b82f6", icon: "🌾" },
              { label: "Fats",            value: plan.macros.fats,     unit: "g",    color: "#a855f7", icon: "🥑" },
              {
                label: "BMI",
                value: plan.bmi,
                unit: bmiCategory(plan.bmi).label,
                color: bmiCategory(plan.bmi).color,
                icon: "📊",
              },
            ].map((stat, i) => (
              <div
                key={stat.label}
                style={{
                  background: "rgba(15,23,42,0.8)",
                  backdropFilter: "blur(20px)",
                  borderRadius: 20, padding: "24px 20px",
                  border: `1px solid ${stat.color}22`,
                  boxShadow: `0 4px 20px ${stat.color}10`,
                  animation: `fadeUp 0.4s ease ${i * 0.08}s both`,
                  position: "relative", overflow: "hidden",
                }}
              >
                <div style={{
                  position: "absolute", top: -20, right: -20,
                  width: 80, height: 80, borderRadius: "50%",
                  background: `radial-gradient(circle, ${stat.color}20, transparent)`,
                }} />
                <div style={{ fontSize: 28, marginBottom: 8 }}>{stat.icon}</div>
                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: 32, fontWeight: 900, color: stat.color, lineHeight: 1 }}>
                  {stat.value}
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#64748b", marginLeft: 4 }}>{stat.unit}</span>
                </div>
              </div>
            ))}
          </div>

          {/* ── Tabs ── */}
          <div style={{
            display: "flex", gap: 8, marginBottom: 24,
            background: "rgba(15,23,42,0.6)",
            borderRadius: 14, padding: 6,
            width: "fit-content",
          }}>
            {[
              { id: "meals",  label: "🍽️ Meal Plan" },
              { id: "macros", label: "📊 Macros"    },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "10px 24px", borderRadius: 10, border: "none",
                  background: activeTab === tab.id
                    ? "linear-gradient(135deg, #22d3ee, #3b82f6)"
                    : "transparent",
                  color: activeTab === tab.id ? "#020617" : "#64748b",
                  fontSize: 14, fontWeight: 700, cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Meal Plan Tab ── */}
          {activeTab === "meals" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {plan.meals.map((meal, idx) => (
                <div
                  key={meal.name}
                  style={{
                    background: "rgba(15,23,42,0.8)",
                    backdropFilter: "blur(20px)",
                    borderRadius: 20, padding: "24px 28px",
                    border: `1px solid ${meal.color}22`,
                    display: "grid",
                    gridTemplateColumns: "auto 1fr auto",
                    gap: 24, alignItems: "center",
                    animation: `fadeUp 0.4s ease ${idx * 0.1}s both`,
                    transition: "transform 0.2s, box-shadow 0.2s",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateX(6px)";
                    e.currentTarget.style.boxShadow = `0 8px 32px ${meal.color}20`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateX(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {/* Icon + Time */}
                  <div style={{ textAlign: "center", minWidth: 72 }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: 16,
                      background: `${meal.color}15`,
                      border: `1px solid ${meal.color}30`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 28, marginBottom: 6,
                    }}>
                      {meal.icon}
                    </div>
                    <div style={{ fontSize: 10, color: "#475569", fontWeight: 600 }}>
                      {meal.time}
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <div style={{
                      fontSize: 17, fontWeight: 800,
                      color: meal.color, marginBottom: 10,
                    }}>
                      {meal.name}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {meal.items.map((item) => (
                        <span
                          key={item}
                          style={{
                            padding: "5px 12px", borderRadius: 999,
                            background: `${meal.color}10`,
                            border: `1px solid ${meal.color}25`,
                            fontSize: 13, color: "#cbd5e1", fontWeight: 500,
                          }}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Calories */}
                  <div style={{ textAlign: "right", minWidth: 80 }}>
                    <div style={{
                      fontSize: 28, fontWeight: 900, color: meal.color,
                      lineHeight: 1,
                    }}>
                      {Math.round(meal.calories * (plan.calories / 1520))}
                    </div>
                    <div style={{ fontSize: 11, color: "#475569", fontWeight: 600, marginTop: 2 }}>
                      kcal
                    </div>
                  </div>
                </div>
              ))}

              {/* Total Bar */}
              <div style={{
                background: "linear-gradient(135deg, rgba(34,211,238,0.1), rgba(59,130,246,0.1))",
                border: "1px solid rgba(34,211,238,0.2)",
                borderRadius: 16, padding: "18px 28px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#e2e8f0" }}>
                  📊 Total Daily Target
                </div>
                <div style={{
                  fontSize: 28, fontWeight: 900,
                  background: "linear-gradient(135deg, #22d3ee, #3b82f6)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>
                  {plan.calories} kcal
                </div>
              </div>
            </div>
          )}

          {/* ── Macros Tab ── */}
          {activeTab === "macros" && (
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 24,
            }}>
              {/* Pie Chart */}
              <div style={{
                background: "rgba(15,23,42,0.8)",
                backdropFilter: "blur(20px)",
                borderRadius: 24, padding: 32,
                border: "1px solid rgba(148,163,184,0.1)",
                display: "flex", flexDirection: "column", alignItems: "center",
              }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 24px", color: "#e2e8f0" }}>
                  Macro Distribution
                </h3>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={macroData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={65}
                      outerRadius={100}
                      paddingAngle={4}
                      animationBegin={0}
                      animationDuration={1200}
                    >
                      {macroData.map((_, idx) => (
                        <Cell key={idx} fill={MACRO_COLORS[idx]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v, n) => [`${v}g`, n]}
                      contentStyle={{
                        background: "rgba(15,23,42,0.95)",
                        border: "1px solid rgba(148,163,184,0.2)",
                        borderRadius: 10, color: "#f1f5f9",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Legend */}
                <div style={{ display: "flex", gap: 20, marginTop: 8 }}>
                  {macroData.map((m, i) => (
                    <div key={m.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: MACRO_COLORS[i] }} />
                      <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>
                        {m.name} <strong style={{ color: "#f1f5f9" }}>{m.value}g</strong>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Macro Bars */}
              <div style={{
                background: "rgba(15,23,42,0.8)",
                backdropFilter: "blur(20px)",
                borderRadius: 24, padding: 32,
                border: "1px solid rgba(148,163,184,0.1)",
                display: "flex", flexDirection: "column", gap: 28,
              }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: "#e2e8f0" }}>
                  Daily Targets
                </h3>

                {[
                  { label: "Protein",       value: plan.macros.protein, max: 250, color: "#22c55e", icon: "💪", cal: plan.macros.protein * 4  },
                  { label: "Carbohydrates", value: plan.macros.carbs,   max: 400, color: "#3b82f6", icon: "🌾", cal: plan.macros.carbs * 4    },
                  { label: "Fats",          value: plan.macros.fats,    max: 150, color: "#f97316", icon: "🥑", cal: plan.macros.fats * 9     },
                ].map((m) => (
                  <div key={m.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>
                        {m.icon} {m.label}
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 800, color: m.color }}>
                        {m.value}g
                        <span style={{ fontSize: 11, color: "#475569", marginLeft: 6 }}>
                          ({m.cal} kcal)
                        </span>
                      </span>
                    </div>
                    <div style={{
                      height: 10, borderRadius: 999,
                      background: "rgba(148,163,184,0.1)",
                      overflow: "hidden",
                    }}>
                      <div style={{
                        height: "100%",
                        width: `${Math.min(100, (m.value / m.max) * 100)}%`,
                        background: `linear-gradient(90deg, ${m.color}, ${m.color}99)`,
                        borderRadius: 999,
                        animation: "growBar 1s ease",
                      }} />
                    </div>
                  </div>
                ))}

                {/* Calorie breakdown */}
                <div style={{
                  marginTop: 8, padding: "16px 20px",
                  background: "rgba(34,211,238,0.06)",
                  border: "1px solid rgba(34,211,238,0.15)",
                  borderRadius: 14,
                }}>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4, fontWeight: 600 }}>
                    TOTAL CALORIES
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: "#22d3ee" }}>
                    {plan.calories}
                    <span style={{ fontSize: 14, color: "#64748b", marginLeft: 6 }}>kcal / day</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#475569", marginTop: 6 }}>
                    Based on your BMR of {plan.bmr} kcal × {ACTIVITY_LABELS[metrics.activityLevel]} activity × {GOAL_LABELS[metrics.goal]} goal
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Water & Tips ── */}
          <div style={{
            marginTop: 24,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
          }}>
            {[
              {
                icon: "💧",
                title: "Daily Water Intake",
                value: `${(+metrics.weightKg * 0.033).toFixed(1)}L`,
                desc: `${Math.round(+metrics.weightKg * 0.033 / 0.25)} glasses of water recommended`,
                color: "#3b82f6",
              },
              {
                icon: "🌙",
                title: "Sleep for Recovery",
                value: "7–9 hrs",
                desc: "Quality sleep boosts muscle growth and fat loss significantly",
                color: "#6366f1",
              },
              {
                icon: "⏰",
                title: "Meal Timing",
                value: "Every 3–4h",
                desc: "Keep metabolism active with regular balanced meals",
                color: "#22c55e",
              },
            ].map((tip) => (
              <div
                key={tip.title}
                style={{
                  background: "rgba(15,23,42,0.7)",
                  borderRadius: 16, padding: "20px 22px",
                  border: `1px solid ${tip.color}20`,
                  display: "flex", gap: 16, alignItems: "flex-start",
                }}
              >
                <div style={{
                  width: 46, height: 46, borderRadius: 12, flexShrink: 0,
                  background: `${tip.color}12`,
                  border: `1px solid ${tip.color}25`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22,
                }}>
                  {tip.icon}
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                    {tip.title}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: tip.color, marginBottom: 4 }}>
                    {tip.value}
                  </div>
                  <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.5 }}>
                    {tip.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes growBar {
          from { width: 0; }
        }
        select option { background: #0f172a; color: #f1f5f9; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.2); border-radius: 3px; }
      `}</style>
    </div>
  );
};

export default Diet;