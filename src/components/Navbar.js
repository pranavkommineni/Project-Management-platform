"use client";
import { useEffect, useState } from "react";

const WORKSPACES = ["Product Team", "Engineering", "Marketing", "Design"];

function initialsOf(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Navbar({ search = "", onSearchChange, notificationCount = 3, userName = "Alex Carter" }) {
  const [theme, setTheme] = useState("dark");
  const [workspace, setWorkspace] = useState(WORKSPACES[0]);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("devchart-theme") : null;
    if (stored) {
      setTheme(stored);
      document.documentElement.setAttribute("data-theme", stored);
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("devchart-theme", next);
  };

  return (
    <nav
      className="glass-strong"
      style={{
        padding: "14px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 20,
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 22, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 18, fontWeight: 800, flexShrink: 0 }}>
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              background: "var(--accent-gradient)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 17,
              boxShadow: "var(--shadow-glow)",
            }}
          >
            ⬡
          </span>
          <span>devChart</span>
        </div>

        <select
          value={workspace}
          onChange={(e) => setWorkspace(e.target.value)}
          className="hide-on-mobile"
          style={{ fontSize: 13 }}
        >
          {WORKSPACES.map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </select>
      </div>

      <div className="hide-on-mobile" style={{ flex: 1, maxWidth: 380, position: "relative" }}>
        <span
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--muted)",
            fontSize: 13,
            pointerEvents: "none",
          }}
        >
          ⌕
        </span>
        <input
          value={search}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="Search tasks, people, tags…"
          style={{ width: "100%", paddingLeft: 32 }}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
        <button
          onClick={toggleTheme}
          title="Toggle theme"
          style={{
            background: "var(--surface2)",
            width: 36,
            height: 36,
            borderRadius: "50%",
            fontSize: 15,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {theme === "dark" ? "🌙" : "☀️"}
        </button>

        <div style={{ position: "relative" }}>
          <button
            onClick={() => setNotifOpen((o) => !o)}
            style={{
              background: "var(--surface2)",
              width: 36,
              height: 36,
              borderRadius: "50%",
              fontSize: 15,
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            🔔
            {notificationCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -2,
                  right: -2,
                  background: "var(--danger)",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 700,
                  borderRadius: "50%",
                  minWidth: 16,
                  height: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 3px",
                }}
              >
                {notificationCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div
              className="glass scale-in"
              style={{
                position: "absolute",
                right: 0,
                top: 44,
                width: 260,
                borderRadius: "var(--radius-md)",
                padding: 14,
                boxShadow: "var(--shadow-lg)",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Notifications</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>You're all caught up 🎉</div>
            </div>
          )}
        </div>

        <div
          className="avatar"
          title={userName}
          style={{ width: 34, height: 34, background: "var(--accent-gradient)" }}
        >
          {initialsOf(userName)}
        </div>
      </div>
    </nav>
  );
}