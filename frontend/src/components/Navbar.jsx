import React from "react";
import { NavLink, Link } from "react-router-dom";
import { UserButton, useUser } from "@clerk/clerk-react";
const Navbar = () => {
  const { user } = useUser();

  const linkStyle = (isActive) => ({
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 500,
    color: isActive ? "#FF6B35" : "#94a3b8",
    padding: "6px 2px",
   borderBottom: isActive ? "2px solid #FF6B35" : "2px solid transparent",
    transition: "color 0.2s, border-color 0.2s",
  });

  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      height: 64,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 36px",
      background: "rgba(2,6,23,0.9)",
      backdropFilter: "blur(16px)",
      borderBottom: "1px solid rgba(148,163,184,0.1)",
    }}>
      {/* Logo */}
<Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
  <div style={{
    width: 36, height: 36, borderRadius: 10,
    background: "linear-gradient(135deg, #FF6B35, #FF9A3C)",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 0 16px rgba(255,107,53,0.3)",
  }}>
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 2L18 7V13L10 18L2 13V7L10 2Z" stroke="white" strokeWidth="1.5" fill="none"/>
      <path d="M10 6L14 8.5V11.5L10 14L6 11.5V8.5L10 6Z" fill="white" opacity="0.5"/>
    </svg>
  </div>
  <span style={{ fontWeight: 500, fontSize: 17, letterSpacing: "0.03em", color: "#f9fafb" }}>
    fit india<span style={{ color: "#FF9A3C" }}>.</span><span style={{ color: "#FF6B35" }}>ai</span>
  </span>
</Link>

      {/* Nav links */}
      <nav style={{ display: "flex", alignItems: "center", gap: 28 }}>
        <NavLink to="/dashboard" style={({ isActive }) => linkStyle(isActive)}>Dashboard</NavLink>
        <NavLink to="/workout"   style={({ isActive }) => linkStyle(isActive)}>Workout</NavLink>
        <NavLink to="/diet"      style={({ isActive }) => linkStyle(isActive)}>Diet</NavLink>
        <NavLink to="/progress"  style={({ isActive }) => linkStyle(isActive)}>Progress</NavLink>
      </nav>

      {/* User info + Clerk UserButton (handles profile & logout) */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {user && (
          <span style={{ fontSize: 13, color: "#64748b" }}>
            {user.firstName ?? user.emailAddresses?.[0]?.emailAddress?.split("@")[0]}
          </span>
        )}

        <UserButton
          afterSignOutUrl="/"
          appearance={{
            variables: {
              colorPrimary: "#FF6B35",
              colorBackground:    "#0f172a",
              colorText:          "#f9fafb",
              colorTextSecondary: "#94a3b8",
              borderRadius:       "10px",
            },
            elements: {
            avatarBox: {
  width: 36, height: 36,
  border: "2px solid rgba(255,107,53,0.45)", // ✅ change
  borderRadius: "50%",
  boxShadow: "0 0 14px rgba(255,107,53,0.2)", // ✅ change
},
              userButtonPopoverCard: {
                background:     "rgba(15,23,42,0.97)",
                border:         "1px solid rgba(148,163,184,0.15)",
                borderRadius:   "12px",
                boxShadow:      "0 20px 50px rgba(0,0,0,0.5)",
                backdropFilter: "blur(16px)",
              },
              userButtonPopoverActionButton: { color: "#e2e8f0" },
              userButtonPopoverActionButtonText: { color: "#e2e8f0" },
              userButtonPopoverFooter: { display: "none" },
            },
          }}
        />
      </div>
    </header>
  );
};

export default Navbar;
