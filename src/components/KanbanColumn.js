"use client";
import TaskCard from "./TaskCard";

export default function KanbanColumn({ stage, tasks, onDragStart, onDrop, onEdit, onDelete }) {
  const handleDragOver = (e) => e.preventDefault();

  return (
    <div style={{
      background: "var(--surface)",
      borderRadius: 12,
      border: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      width: 320,
      flexShrink: 0,
    }}>
      {/* Column header */}
      <div style={{
        borderBottom: "1px solid var(--border)",
        padding: "14px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 12,
            height: 12,
            borderRadius: 3,
            background: stage.color,
          }} />
          {stage.label}
        </div>
        <div style={{
          background: "var(--surface2)",
          borderRadius: 4,
          padding: "2px 6px",
          fontSize: 11,
          color: "var(--muted)",
        }}>
          {tasks.length}
        </div>
      </div>

      {/* Cards */}
      <div
        onDragOver={handleDragOver}
        onDrop={onDrop}
        style={{
          flex: 1,
          padding: 12,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          overflow: "auto",
        }}
      >
        {tasks.length === 0 && (
          <div style={{
            textAlign: "center",
            color: "var(--muted)",
            fontSize: 12,
            padding: "24px 8px",
          }}>
            Drop tasks here
          </div>
        )}
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            draggable
            onDragStart={() => onDragStart(task._id)}
            onEdit={() => onEdit(task)}
            onDelete={() => onDelete(task._id)}
          />
        ))}
      </div>
    </div>
  );
}
