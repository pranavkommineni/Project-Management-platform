"use client";
import { useState, useEffect, useCallback } from "react";
import KanbanColumn from "./KanbanColumn";
import TaskModal from "./TaskModal";
import ActivityFeed from "./ActivityFeed";

const STAGES = [
  { id: "todo", label: "To Do", color: "var(--todo)" },
  { id: "inprogress", label: "In Progress", color: "var(--inprogress)" },
  { id: "done", label: "Done", color: "var(--done)" },
];

export default function KanbanBoard() {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [draggedId, setDraggedId] = useState(null);
  const [activityKey, setActivityKey] = useState(0); // used to refresh activity feed

  const fetchTasks = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (priorityFilter) params.set("priority", priorityFilter);
    const res = await fetch(`/api/tasks?${params}`);
    const data = await res.json();
    setTasks(data);
  }, [search, priorityFilter]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleDrop = async (stage) => {
    if (!draggedId) return;
    const task = tasks.find((t) => t._id === draggedId);
    if (!task || task.stage === stage) return;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t._id === draggedId ? { ...t, stage } : t))
    );

    await fetch(`/api/tasks/${draggedId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage }),
    });

    setActivityKey((k) => k + 1);
    setDraggedId(null);
  };

  const handleSave = async (data) => {
    if (editingTask) {
      await fetch(`/api/tasks/${editingTask._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    }
    setModalOpen(false);
    setEditingTask(null);
    setActivityKey((k) => k + 1);
    fetchTasks();
  };

  const handleDelete = async (id) => {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    setActivityKey((k) => k + 1);
    fetchTasks();
  };

  const openCreate = () => { setEditingTask(null); setModalOpen(true); };
  const openEdit = (task) => { setEditingTask(task); setModalOpen(true); };

  return (
    <div style={{ display: "flex", height: "calc(100vh - 64px)" }}>

      {/* Board area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>

        {/* Toolbar */}
        <div style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          padding: "16px 24px",
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexShrink: 0,
        }}>
          <input
            type="text"
            placeholder="Search tasks…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, maxWidth: 300 }}
          />
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{ flex: 0 }}
          >
            <option value="">All priorities</option>
            <option value="high">🔴 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">⚪ Low</option>
          </select>
          <button
            onClick={openCreate}
            style={{
              background: "var(--accent)",
              color: "#fff",
              padding: "8px 16px",
              flex: 0,
            }}
          >
            + New Task
          </button>
        </div>

        {/* Columns */}
        <div style={{
          display: "flex",
          gap: 16,
          padding: 24,
          flex: 1,
          overflow: "auto",
        }}>
          {STAGES.map((stage) => (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              tasks={tasks.filter((t) => t.stage === stage.id)}
              onDragStart={(id) => setDraggedId(id)}
              onDrop={() => handleDrop(stage.id)}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>

      {/* Activity feed */}
      <ActivityFeed refreshKey={activityKey} />

      {/* Modal */}
      {modalOpen && (
        <TaskModal
          task={editingTask}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditingTask(null); }}
        />
      )}
    </div>
  );
}
