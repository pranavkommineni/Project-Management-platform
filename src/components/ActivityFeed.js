"use client";
import { useEffect, useState } from "react";

const ACTION_ICONS = { created: "✅", moved: "↔️", deleted: "🗑️" };

export default function ActivityFeed({ refreshKey }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch("/api/activity")
      .then((r) => r.json())
      .then(setLogs);
  }, [refreshKey]);

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div style={{
      width: 280,
      borderLeft: "1px solid var(--border)",
      background: "var(--surface)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>
      <div style={{
        borderBottom: "1px solid var(--border)",
        padding: "16px",
        fontWeight: 600,
        fontSize: 13,
      }}>
        Activity
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: 12 }}>
        {logs.length === 0 ? (
          <div style={{ color: "var(--muted)", fontSize: 12, textAlign: "center", marginTop: 24 }}>
            No activity yet
          </div>
        ) : (
          logs.map((log, idx) => (
            <div
              key={idx}
              style={{
                marginBottom: 12,
                paddingBottom: 12,
                borderBottom: idx < logs.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <div style={{
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
                fontSize: 12,
              }}>
                <span style={{ fontSize: 14, marginTop: 1 }}>
                  {ACTION_ICONS[log.action] || "•"}
                </span>
                <div>
                  <div style={{ fontWeight: 500 }}>
                    {log.taskTitle}
                  </div>

                  {log.detail && (
                    <div style={{ color: "var(--muted)", fontSize: 11, marginTop: 2 }}>
                      {log.detail}
                    </div>
                  )}
                  <div style={{
                    color: "var(--muted)",
                    fontSize: 10,
                    marginTop: 4,
                  }}>
                    {timeAgo(log.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
