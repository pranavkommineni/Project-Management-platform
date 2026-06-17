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
          fontWeight: 600,
          fontSize: 13,
        }}
      >
        <span>Activity Feed</span>

        <button
          onClick={() => {
            setLoading(true);
            fetchActivities();
          }}
          title="Refresh"
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          🔄
        </button>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 12,
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
              color: "#ef4444",
              fontSize: 12,
            }}
          >
            {error}
          </div>
        )}

        {!loading && !error && logs.length === 0 && (
          <div
            style={{
              textAlign: "center",
              paddingTop: 24,
              color: "var(--muted)",
              fontSize: 12,
            }}
          >
            No activity yet
          </div>
        )}

        {!loading &&
          !error &&
          logs.map((log) => (
            <div
              key={
                log._id ||
                `${log.taskId}-${log.createdAt}`
              }
              style={{
                marginBottom: 12,
                paddingBottom: 12,
                borderBottom:
                  "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                >
                  {ACTION_ICONS[log.action] || "📌"}
                </span>

                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 12,
                      wordBreak: "break-word",
                    }}
                  >
                    {log.taskTitle || "Untitled Task"}
                  </div>

                  {log.detail && (
                    <div
                      style={{
                        color: "var(--muted)",
                        fontSize: 11,
                        marginTop: 4,
                        lineHeight: 1.4,
                        wordBreak: "break-word",
                      }}
                    >
                      {log.detail}
                    </div>
                  )}

                  <div
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
            </div>
          ))}
      </div>
    </aside>
  );
}