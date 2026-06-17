"use client";

import { useState } from "react";
import TaskCard from "./TaskCard";

export default function KanbanColumn({
  stage,
  tasks,
  onDragStart,
  onDrop,
  onEdit,
  onDelete,
}) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  return (
    <div
      style={{
        background: "var(--surface)",
        borderRadius: 14,
        border: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        width: 320,
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      <div style={{ height: 3, background: stage.color, flexShrink: 0 }} />

      <div
        style={{
          borderBottom: "1px solid var(--border)",
          padding: "13px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 13.5,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: stage.color,
              boxShadow: `0 0 0 3px color-mix(in srgb, ${stage.color} 18%, transparent)`,
            }}
          />
          {stage.label}
        </div>

        <div
          className="count-badge"
          style={{
            background: `color-mix(in srgb, ${stage.color} 16%, transparent)`,
            color: stage.color,
            borderRadius: "var(--radius-pill)",
            padding: "2px 9px",
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          {tasks.length}
        </div>
      </div>

      <div
        className={`column-drop-zone scrollbar-thin${isDragOver ? " drag-over" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          onDrop();
        }}
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
          <div className="empty-state">
            Drop tasks here
          </div>
        )}

        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            draggable
            onDragStart={() =>
              onDragStart(task._id)
            }
            onEdit={() =>
              onEdit(task)
            }
            onDelete={() =>
              onDelete(task._id)
            }
          />
        ))}
      </div>
    </div>
  );
}
