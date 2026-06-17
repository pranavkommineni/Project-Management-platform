"use client";

const PRIORITY_COLORS = { high: "var(--danger)", medium: "var(--inprogress)", low: "var(--todo)" };
const PRIORITY_LABELS = { high: "High", medium: "Med", low: "Low" };

function initials(name) {
  if (!name) return "";
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function IconEdit() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 16.5V20h3.5L18 9.5l-3.5-3.5L4 16.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M13 7.5 16.5 11" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="5.5" width="17" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconAlert() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3.5 21 19H3L12 3.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 10v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="16.6" r="0.9" fill="currentColor" />
    </svg>
  );
}

export default function TaskCard({ task, onDragStart, onEdit, onDelete }) {
  const due = task.dueDate ? new Date(task.dueDate) : null;
  const overdue = due && due < new Date();
  const priorityColor = PRIORITY_COLORS[task.priority];

  return (
    <div
      className="task-card"
      draggable
      onDragStart={onDragStart}
      style={{
        background: "var(--surface2)",
        border: "1px solid var(--border)",
        borderLeft: `3px solid ${priorityColor}`,
        borderRadius: 10,
        padding: 12,
        cursor: "grab",
      }}
    >
      {/* Priority chip + actions */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 9,
      }}>
        <span
          className="priority-chip"
          style={{
            background: `color-mix(in srgb, ${priorityColor} 16%, transparent)`,
            color: priorityColor,
          }}
        >
          <span className="priority-dot" style={{ background: priorityColor }} />
          {PRIORITY_LABELS[task.priority]}
        </span>

        <div style={{ display: "flex", gap: 2 }}>
          <button
            className="icon-btn"
            onClick={onEdit}
            aria-label="Edit task"
            title="Edit task"
          >
            <IconEdit />
          </button>
          <button
            className="icon-btn danger"
            onClick={onDelete}
            aria-label="Delete task"
            title="Delete task"
          >
            <IconTrash />
          </button>
        </div>
      </div>

      {/* Title */}
      <div style={{
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: 13.5,
        marginBottom: 6,
        lineHeight: 1.35,
        color: "var(--text)",
      }}>
        {task.title}
      </div>

      {/* Description */}
      {task.description && (
        <div style={{
          fontSize: 12,
          color: "var(--muted)",
          marginBottom: 10,
          lineHeight: 1.45,
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
        paddingTop: 9,
        borderTop: "1px solid var(--border)",
      }}>
        {task.assignee ? (
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              className="avatar"
              style={{ width: 18, height: 18, fontSize: 8.5, background: "var(--accent-gradient-cool)" }}
            >
              {initials(task.assignee)}
            </span>
            {task.assignee}
          </span>
        ) : <span />}

        {due && (
          <span
            className="task-due"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              color: overdue ? "var(--danger)" : "var(--muted)",
              fontWeight: overdue ? 700 : 500,
            }}
          >
            {overdue ? <IconAlert /> : <IconCalendar />}
            {due.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </span>
        )}
      </div>
    </div>
  );
}
