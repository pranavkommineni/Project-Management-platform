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

function IconSearch() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconSun() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="2" />
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8l1.8-1.8M18 6l1.8-1.8" />
      </g>
    </svg>
  );
}

function IconMoon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a7 7 0 0 0 11 11Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconBell() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 9.5a6 6 0 1 1 12 0v3.5l1.5 3H4.5l1.5-3V9.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M9.5 19a2.5 2.5 0 0 0 5 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
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
        padding: "13px 24px",
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
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <span
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "var(--accent-gradient-cool)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "var(--shadow-glow)",
              flexShrink: 0,
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z"
                stroke="#fff"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path d="M4 7.5 12 12l8-4.5M12 12v9" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
          </span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: "-0.02em",
            }}
          >
            devChart
          </span>
        </div>

        <select
          value={workspace}
          onChange={(e) => setWorkspace(e.target.value)}
          className="hide-on-mobile"
          style={{ fontSize: 13, background: "var(--surface)" }}
        >
          {WORKSPACES.map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </select>
      </div>

      <div className="hide-on-mobile" style={{ flex: 1, maxWidth: 400, position: "relative" }}>
        <span
          style={{
            position: "absolute",
            left: 13,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--muted)",
            display: "flex",
            pointerEvents: "none",
          }}
        >
          <IconSearch />
        </span>
        <input
          value={search}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="Search tasks, people, tags…"
          style={{
            width: "100%",
            paddingLeft: 34,
            borderRadius: "var(--radius-pill)",
            background: "var(--surface)",
          }}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <button
          onClick={toggleTheme}
          title="Toggle theme"
          aria-label="Toggle color theme"
          style={{
            background: "var(--surface2)",
            width: 36,
            height: 36,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-dim)",
          }}
        >
          {theme === "dark" ? <IconSun /> : <IconMoon />}
        </button>

        <div style={{ position: "relative" }}>
          <button
            onClick={() => setNotifOpen((o) => !o)}
            aria-label="Notifications"
            style={{
              background: "var(--surface2)",
              width: 36,
              height: 36,
              borderRadius: "50%",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-dim)",
            }}
          >
            <IconBell />
            {notificationCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -2,
                  right: -2,
                  background: "var(--accent-warm)",
                  color: "#fff",
                  fontSize: 10,
                  fontFamily: "var(--font-mono)",
                  fontWeight: 700,
                  borderRadius: "50%",
                  minWidth: 16,
                  height: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 3px",
                  boxShadow: "0 0 0 2px var(--surface-solid)",
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
                top: 46,
                width: 270,
                borderRadius: "var(--radius-md)",
                padding: 14,
                boxShadow: "var(--shadow-lg)",
                background: "var(--surface-solid)",
              }}
            >
              <div style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                Notifications
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>You're all caught up 🎉</div>
            </div>
          )}
        </div>

        <div
          className="avatar"
          title={userName}
          style={{
            width: 34,
            height: 34,
            background: "var(--accent-gradient)",
            boxShadow: "0 0 0 2px var(--surface-solid), 0 0 0 3px var(--border-strong)",
          }}
        >
          {initialsOf(userName)}
        </div>
      </div>
    </nav>
  );
}