"use client";

import { useState } from "react";

const OVERLAY = {
  position: "fixed",
  inset: 0,
  background: "rgba(5,4,12,0.72)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 100,
  padding: 20,
};

const BOX = {
  background: "var(--surface-solid)",
  border: "1px solid var(--border)",
  borderRadius: 18,
  padding: 28,
  width: "100%",
  maxWidth: 460,
  display: "flex",
  flexDirection: "column",
  gap: 14,
  boxShadow: "var(--shadow-lg)",
};

const labelStyle = {
  display: "block",
  fontSize: 11.5,
  color: "var(--muted)",
  marginBottom: 6,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.03em",
};

const STAGE_OPTIONS = [
  { value: "todo", label: "To Do", color: "var(--todo)" },
  { value: "inprogress", label: "In Progress", color: "var(--inprogress)" },
  { value: "done", label: "Done", color: "var(--done)" },
];

const PRIORITY_OPTIONS = [
  { value: "high", label: "🔴 High", color: "var(--danger)" },
  { value: "medium", label: "🟡 Medium", color: "var(--inprogress)" },
  { value: "low", label: "⚪ Low", color: "var(--todo)" },
];

function IconClose() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 5l14 14M19 5 5 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PillSelect({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              flex: "1 1 auto",
              padding: "8px 10px",
              borderRadius: "var(--radius-pill)",
              fontSize: 12,
              fontWeight: 600,
              background: active
                ? `color-mix(in srgb, ${opt.color} 22%, transparent)`
                : "var(--surface2)",
              color: active ? opt.color : "var(--text-dim)",
              border: active
                ? `1px solid color-mix(in srgb, ${opt.color} 55%, transparent)`
                : "1px solid var(--border)",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default function TaskModal({
  task,
  onSave,
  onClose,
}) {
  const [title, setTitle] = useState(
    task?.title || ""
  );

  const [description, setDescription] =
    useState(task?.description || "");

  const [stage, setStage] = useState(
    task?.stage || "todo"
  );

  const [priority, setPriority] =
    useState(task?.priority || "medium");

  const [assignee, setAssignee] =
    useState(task?.assignee || "");

  const [dueDate, setDueDate] =
    useState(
      task?.dueDate
        ? new Date(task.dueDate)
            .toISOString()
            .split("T")[0]
        : ""
    );

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError(
        "Task title is required."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      await onSave({
        title: title.trim(),
        description:
          description.trim(),
        stage,
        priority,
        assignee:
          assignee.trim(),
        dueDate:
          dueDate || null,
      });
    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "Failed to save task."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={OVERLAY}
      onClick={(e) => {
        if (
          e.target ===
          e.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div style={BOX} className="scale-in">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 19 }}>
            {task ? "Edit Task" : "New Task"}
          </h2>
          <button
            className="icon-btn"
            onClick={onClose}
            aria-label="Close"
            title="Close"
          >
            <IconClose />
          </button>
        </div>

        {error && (
          <div
            style={{
              color: "var(--danger)",
              fontSize: 13,
              background: "rgba(255,93,108,0.1)",
              border: "1px solid rgba(255,93,108,0.25)",
              borderRadius: "var(--radius-sm)",
              padding: "8px 12px",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <div>
          <label style={labelStyle}>
            Title *
          </label>

          <input
            value={title}
            onChange={(e) =>
              setTitle(
                e.target.value
              )
            }
            placeholder="What needs to be done?"
            autoFocus
            style={{ width: "100%" }}
          />
        </div>

        <div>
          <label style={labelStyle}>
            Description
          </label>

          <textarea
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
            placeholder="Optional details..."
            style={{
              width: "100%",
              resize: "vertical",
              minHeight: 80,
            }}
          />
        </div>

        <div>
          <label style={labelStyle}>Stage</label>
          <PillSelect options={STAGE_OPTIONS} value={stage} onChange={setStage} />
        </div>

        <div>
          <label style={labelStyle}>Priority</label>
          <PillSelect options={PRIORITY_OPTIONS} value={priority} onChange={setPriority} />
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
          }}
        >
          <div
            style={{ flex: 1 }}
          >
            <label
              style={
                labelStyle
              }
            >
              Assignee
            </label>

            <input
              value={assignee}
              onChange={(e) =>
                setAssignee(
                  e.target.value
                )
              }
              placeholder="Name..."
              style={{ width: "100%" }}
            />
          </div>

          <div
            style={{ flex: 1 }}
          >
            <label
              style={
                labelStyle
              }
            >
              Due Date
            </label>

            <input
              type="date"
              value={dueDate}
              onChange={(e) =>
                setDueDate(
                  e.target.value
                )
              }
              style={{ width: "100%" }}
            />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 12,
          }}
        >
          <button
            onClick={onClose}
            disabled={saving}
            style={{
              flex: 1,
              background:
                "var(--surface2)",
              color:
                "var(--text)",
              padding:
                "11px",
              borderRadius: "var(--radius-pill)",
            }}
          >
            Cancel
          </button>

          <button
            onClick={
              handleSubmit
            }
            disabled={saving}
            className="pill-btn-accent"
            style={{
              flex: 1,
              justifyContent: "center",
              padding:
                "11px",
            }}
          >
            {saving
              ? "Saving..."
              : task
              ? "Save Changes"
              : "Create Task"}
          </button>
        </div>
      </div>
    </div>
  );
}
