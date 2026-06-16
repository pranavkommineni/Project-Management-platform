"use client";

const PRIORITY_COLORS = { high: "#ef4444", medium: "#f59e0b", low: "#6b7280" };
const PRIORITY_LABELS = { high: "High", medium: "Med", low: "Low" };

export default function TaskCard({ task, onDragStart, onEdit, onDelete }) {
  const due = task.dueDate ? new Date(task.dueDate) : null;
  const overdue = due && due < new Date();

  return (
    <div
      draggable
      onDragStart={onDragStart}
      style={{
        background: "var(--surface2)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: 12,
        cursor: "grab",
        transition: "border-color 0.15s",
      }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--accent)"}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border)"}
    >
      {/* Priority badge */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
      }}>
        <span style={{
          background: PRIORITY_COLORS[task.priority],
          color: "#fff",
          fontSize: 10,
          fontWeight: 600,
          padding: "2px 6px",
          borderRadius: 4,
        }}>
          {PRIORITY_LABELS[task.priority]}
        </span>

        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={onEdit}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--muted)",
              fontSize: 12,
              cursor: "pointer",
              padding: 0,
            }}
          >
            ✏️
          </button>
          <button
            onClick={onDelete}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--muted)",
              fontSize: 12,
              cursor: "pointer",
              padding: 0,
            }}
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Title */}
      <div style={{
        fontWeight: 600,
        fontSize: 13,
        marginBottom: 6,
        lineHeight: 1.3,
      }}>
        {task.title}
      </div>

      {/* Description */}
      {task.description && (
        <div style={{
          fontSize: 12,
          color: "var(--muted)",
          marginBottom: 8,
          lineHeight: 1.4,
        }}>
          {task.description.length > 80 ? task.description.slice(0, 80) + "…" : task.description}
        </div>
      )}

      {/* Footer: assignee + due date */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: 11,
        color: "var(--muted)",
      }}>
        {task.assignee ? (
          <span>
            👤 {task.assignee}
          </span>
        ) : <span />}

        {due && (
          <span style={{ color: overdue ? "#ef4444" : "inherit" }}>
            {overdue ? "⚠️ " : "📅 "}
            {due.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </span>
        )}
      </div>
    </div>
  );
}
