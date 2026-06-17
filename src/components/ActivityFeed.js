"use client";

import { useEffect, useState, useCallback } from "react";

const ACTION_ICONS = {
  created: "✅",
  moved: "↔️",
  deleted: "🗑️",
  updated: "✏️",
  assigned: "👤",
  completed: "🎉",
};

const ACTION_COLORS = {
  created: "var(--done)",
  moved: "var(--accent)",
  deleted: "var(--danger)",
  updated: "var(--inprogress)",
  assigned: "var(--accent-2)",
  completed: "var(--accent-warm)",
};

function IconRefresh() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ActivityFeed({ refreshKey }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchActivities = useCallback(async (signal) => {
    try {
      setError("");

      const response = await fetch("/api/activity", {
        signal,
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch activities (${response.status})`
        );
      }

      const data = await response.json();

      const sortedLogs = Array.isArray(data)
        ? [...data].sort(
            (a, b) =>
              new Date(b.createdAt) -
              new Date(a.createdAt)
          )
        : [];

      setLogs(sortedLogs);
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error(err);
        setError(err.message || "Failed to load activity");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    fetchActivities(controller.signal);

    return () => controller.abort();
  }, [refreshKey, fetchActivities]);

  const timeAgo = (dateString) => {
    if (!dateString) return "Unknown";

    const seconds = Math.floor(
      (Date.now() - new Date(dateString).getTime()) / 1000
    );

    if (seconds < 60) return "just now";

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;

    return new Date(dateString).toLocaleDateString();
  };

  return (
    <aside
      aria-label="Activity Feed"
      style={{
        width: 320,
        borderLeft: "1px solid var(--border)",
        background: "var(--surface)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: "1px solid var(--border)",
          padding: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 13.5,
        }}
      >
        <span>Activity Feed</span>

        <button
          className="icon-btn"
          onClick={() => {
            setLoading(true);
            fetchActivities();
          }}
          title="Refresh"
          aria-label="Refresh activity"
        >
          <IconRefresh />
        </button>
      </div>

      {/* Content */}
      <div
        className="scrollbar-thin"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 14px",
        }}
      >
        {loading && (
          <div
            style={{
              textAlign: "center",
              paddingTop: 24,
              color: "var(--muted)",
              fontSize: 12,
            }}
          >
            Loading activity...
          </div>
        )}

        {!loading && error && (
          <div
            style={{
              textAlign: "center",
              paddingTop: 24,
              color: "var(--danger)",
              fontSize: 12,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {!loading && !error && logs.length === 0 && (
          <div className="empty-state">
            No activity yet
          </div>
        )}

        {!loading &&
          !error &&
          logs.map((log) => {
            const color = ACTION_COLORS[log.action] || "var(--muted)";
            return (
              <div
                key={
                  log._id ||
                  `${log.taskId}-${log.createdAt}`
                }
                className="timeline-item"
                style={{
                  marginBottom: 18,
                }}
              >
                <span
                  className="timeline-dot"
                  style={{
                    background: `color-mix(in srgb, ${color} 18%, transparent)`,
                    boxShadow: `0 0 0 1px color-mix(in srgb, ${color} 35%, transparent)`,
                  }}
                >
                  {ACTION_ICONS[log.action] || "📌"}
                </span>

                <div
                  style={{
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 12.5,
                      wordBreak: "break-word",
                      color: "var(--text)",
                    }}
                  >
                    {log.taskTitle || "Untitled Task"}
                  </div>

                  {log.detail && (
                    <div
                      style={{
                        color: "var(--muted)",
                        fontSize: 11.5,
                        marginTop: 4,
                        lineHeight: 1.4,
                        wordBreak: "break-word",
                      }}
                    >
                      {log.detail}
                    </div>
                  )}

                  <div
                    className="mono"
                    style={{
                      color: "var(--muted)",
                      fontSize: 10,
                      marginTop: 6,
                    }}
                  >
                    {timeAgo(log.createdAt)}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </aside>
  );
}
