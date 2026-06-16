"use client";
import { useState } from "react";

const OVERLAY = {
  position: "fixed", inset: 0,
  background: "rgba(0,0,0,0.7)",
  display: "flex", alignItems: "center", justifyContent: "center",
  zIndex: 100,
};

const BOX = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 14,
  padding: 28,
  width: "100%",
  maxWidth: 440,
  display: "flex",
  flexDirection: "column",
  gap: 14,
};

export default function TaskModal({ task, onSave, onClose }) {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [stage, setStage] = useState(task?.stage || "todo");
  const [priority, setPriority] = useState(task?.priority || "medium");
  const [assignee, setAssignee] = useState(task?.assignee || "");
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""
  );

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSave({ title, description, stage, priority, assignee, dueDate: dueDate || null });
  };

  return (
    <div style={OVERLAY} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={BOX}>
        <h2 style={{ marginBottom: 6 }}>
          {task ? "Edit Task" : "New Task"}
        </h2>

        <div>
          <label style={labelStyle}>Title *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            autoFocus
          />
        </div>

        <div>
          <label style={labelStyle}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional details…"
            style={{ resize: "vertical", minHeight: 80 }}
          />
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Stage</label>
            <select value={stage} onChange={(e) => setStage(e.target.value)}>
              <option value="todo">To Do</option>
              <option value="inprogress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">⚪ Low</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Assignee</label>
            <input
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              placeholder="Name…"
            />
          </div>

          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              background: "var(--surface2)",
              color: "var(--text)",
              padding: "10px",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            style={{
              flex: 1,
              background: "var(--accent)",
              color: "#fff",
              padding: "10px",
            }}
          >
            {task ? "Save Changes" : "Create Task"}
          </button>
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: 12,
  color: "var(--muted)",
  marginBottom: 5,
  fontWeight: 500,
};
