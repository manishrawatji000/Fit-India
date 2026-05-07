import React, { useState, useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { UserButton, useUser } from "@clerk/clerk-react";
import API from "../api.js";

const Navbar = () => {
  const { user } = useUser();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const syncUser = async () => {
      if (user) {
        try {
          const email = user.primaryEmailAddress?.emailAddress;
          const name = user.fullName || user.firstName || email.split("@")[0];
          const { data } = await API.post("/auth/clerk-sync", { email, name });
          if (data && data.token) {
            localStorage.setItem("token", data.token);
            console.log("Clerk authenticated user synced with MongoDB.");
            window.dispatchEvent(new Event("user-synced"));
          }
        } catch (err) {
          console.error("Failed to sync Clerk user with backend:", err);
        }
      }
    };
    syncUser();
  }, [user]);

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: "⚡" },
    { to: "/workout",   label: "Workout",   icon: "🏋️" },
    { to: "/diet",      label: "Diet",      icon: "🥗" },
    { to: "/progress",  label: "Progress",  icon: "📊" },
    { to: "/ai-coach",  label: "AI Coach",  icon: "🤖" },
    { to: "/elite",     label: "Elite Lab", icon: "👑" },
    { to: "/profile",   label: "Profile",   icon: "👤" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

        @keyframes pulseGreen {
          0%, 100% { box-shadow: 0 0 0 0 rgba(141,198,63,0.4); }
          50%       { box-shadow: 0 0 0 10px rgba(141,198,63,0); }
        }

        .app-nav-link {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #3A5A1A;
          text-decoration: none;
          cursor: pointer;
          background: none;
          border: none;
          padding: 4px 0;
          transition: color 0.2s ease;
          position: relative;
          display: flex;
          align-items: center;
          gap: 5px;
          letter-spacing: 0.01em;
        }
        .app-nav-link::after {
          content: '';
          position: absolute;
          bottom: -3px;
          left: 0;
          width: 0;
          height: 2px;
          background: #8DC63F;
          transition: width 0.3s ease;
          border-radius: 2px;
        }
        .app-nav-link:hover { color: #1A2B0A; }
        .app-nav-link:hover::after { width: 100%; }
        .app-nav-link.active {
          color: #3A7A10 !important;
          font-weight: 700 !important;
        }
        .app-nav-link.active::after {
          width: 100% !important;
          background: #8DC63F !important;
        }

        .app-nav-icon { font-size: 13px; line-height: 1; }
      `}</style>

      <header style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 200,
        height: 62,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 60px",
        background: scrolled
          ? "rgba(247,249,242,0.97)"
          : "rgba(247,249,242,0.92)",
        backdropFilter: "blur(16px)",
        borderBottom: `1px solid ${scrolled ? "rgba(141,198,63,0.22)" : "rgba(210,225,180,0.4)"}`,
        transition: "all 0.3s ease",
        boxShadow: scrolled ? "0 2px 24px rgba(141,198,63,0.1)" : "none",
      }}>

        {/* ── Logo ── */}
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: "linear-gradient(135deg, #5A9010, #8DC63F)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 16px rgba(141,198,63,0.38)",
            animation: "pulseGreen 3s ease-in-out infinite",
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 17 }}>💪</span>
          </div>
          <span style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: 18,
            color: "#3A7A10",
            letterSpacing: "-0.01em",
          }}>
            FitIndia<span style={{ color: "#8DC63F" }}>.ai</span>
          </span>
        </Link>

        {/* ── Nav Links ── */}
        <nav style={{ display: "flex", alignItems: "center", gap: 30 }}>
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `app-nav-link${isActive ? " active" : ""}`
              }
            >
              <span className="app-nav-icon">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* ── Right: User info + Avatar ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {user && (
            <span style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: "#667755",
              fontWeight: 500,
            }}>
              👋 {user.firstName ?? user.emailAddresses?.[0]?.emailAddress?.split("@")[0]}
            </span>
          )}

          <UserButton
            afterSignOutUrl="/"
            appearance={{
              variables: {
                colorPrimary:       "#8DC63F",
                colorBackground:    "#F7F9F2",
                colorText:          "#1A2B0A",
                colorTextSecondary: "#667755",
                borderRadius:       "10px",
              },
              elements: {
                avatarBox: {
                  width: 36,
                  height: 36,
                  border: "2px solid rgba(141,198,63,0.55)",
                  borderRadius: "50%",
                  boxShadow: "0 0 14px rgba(141,198,63,0.25)",
                },
                userButtonPopoverCard: {
                  background:     "rgba(247,249,242,0.98)",
                  border:         "1px solid rgba(141,198,63,0.2)",
                  borderRadius:   "14px",
                  boxShadow:      "0 20px 60px rgba(0,0,0,0.12)",
                  backdropFilter: "blur(16px)",
                },
                userButtonPopoverActionButton: { color: "#3A5A1A" },
                userButtonPopoverActionButtonText: { color: "#3A5A1A" },
                userButtonPopoverFooter: { display: "none" },
              },
            }}
          />
        </div>
      </header>
    </>
  );
};

export default Navbar;
