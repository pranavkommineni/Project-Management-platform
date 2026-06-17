"use client";

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";

import KanbanColumn from "./KanbanColumn";
import TaskModal from "./TaskModal";
import ActivityFeed from "./ActivityFeed";

const STAGES = [
  {
    id: "todo",
    label: "To Do",
    color: "var(--todo)",
  },
  {
    id: "inprogress",
    label: "In Progress",
    color: "var(--inprogress)",
  },
  {
    id: "done",
    label: "Done",
    color: "var(--done)",
  },
];

function IconSearch() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 4v16M4 12h16" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function IconSpinner() {
  return (
    <svg className="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="var(--border)" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function KanbanBoard() {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [draggedId, setDraggedId] = useState(null);

  const [activityKey, setActivityKey] = useState(0);

  const searchTimeout = useRef(null);

  const refreshActivity = () => {
    setActivityKey((prev) => prev + 1);
  };

  const apiRequest = async (url, options = {}) => {
    const response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });

    if (!response.ok) {
      let message = "Request failed";
      try {
        const err = await response.json();
        message = err.message || err.error || message;
      } catch {}
      throw new Error(message);
    }

    if (response.status === 204) return null;
    return response.json();
  };

  const fetchTasks = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      params.set("all", "true");
      if (search.trim()) params.set("search", search.trim());
      if (priorityFilter) params.set("priority", priorityFilter);

      const response = await fetch(`/api/tasks?${params.toString()}`, {
        signal,
        cache: "no-store",
      });

      if (!response.ok) throw new Error(`Failed to fetch tasks (${response.status})`);

      const data = await response.json();
      const taskList = Array.isArray(data) ? data : data.tasks || [];
      setTasks(taskList);
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error(err);
        setError(err.message || "Failed to load tasks");
      }
    } finally {
      setLoading(false);
    }
  }, [search, priorityFilter]);

  useEffect(() => {
    const controller = new AbortController();
    fetchTasks(controller.signal);
    return () => controller.abort();
  }, [fetchTasks]);

  const handleSearch = (value) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => setSearch(value), 300);
  };

  const handleSave = async (taskData) => {
    try {
      setError("");
      if (editingTask?._id) {
        await apiRequest(`/api/tasks/${editingTask._id}`, {
          method: "PATCH",
          body: JSON.stringify(taskData),
        });
      } else {
        await apiRequest("/api/tasks", {
          method: "POST",
          body: JSON.stringify(taskData),
        });
      }
      await fetchTasks();
      setModalOpen(false);
      setEditingTask(null);
      refreshActivity();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save task");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Delete this task?");
    if (!confirmed) return;
    try {
      await apiRequest(`/api/tasks/${id}`, { method: "DELETE" });
      setTasks((prev) => prev.filter((task) => task._id !== id));
      refreshActivity();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete task");
    }
  };

  const handleDrop = async (stage) => {
    if (!draggedId) return;
    try {
      await apiRequest(`/api/tasks/${draggedId}`, {
        method: "PATCH",
        body: JSON.stringify({ stage }),
      });
      setTasks((prev) =>
        prev.map((task) => task._id === draggedId ? { ...task, stage } : task)
      );
      refreshActivity();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to move task");
    } finally {
      setDraggedId(null);
    }
  };

  const openCreate = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const groupedTasks = useMemo(() => ({
    todo: tasks.filter((task) => task.stage === "todo"),
    inprogress: tasks.filter((task) => task.stage === "inprogress"),
    done: tasks.filter((task) => task.stage === "done"),
  }), [tasks]);

  const totalCount = tasks.length;
  const doneCount = groupedTasks.done.length;
  const progressPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const PRIORITY_OPTIONS = [
    { value: "", label: "All" },
    { value: "high", label: "High" },
    { value: "medium", label: "Med" },
    { value: "low", label: "Low" },
  ];

  return (
    <div style={{ display: "flex", height: "calc(100vh - 62px)" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* ── Toolbar ── */}
        <div
          className="stack-on-mobile"
          style={{
            borderBottom: "1px solid var(--border)",
            padding: "12px 20px",
            display: "flex",
            gap: 10,
            alignItems: "center",
            flexShrink: 0,
            background: "rgba(15,14,26,0.45)",
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Search */}
          <div style={{ flex: 1, maxWidth: 320, position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--muted)",
                display: "flex",
                pointerEvents: "none",
              }}
            >
              <IconSearch />
            </span>
            <input
              type="text"
              placeholder="Search tasks..."
              defaultValue={search}
              onChange={(e) => handleSearch(e.target.value)}
              style={{
                width: "100%",
                paddingLeft: 32,
                borderRadius: "var(--radius-pill)",
                background: "var(--surface2)",
                fontSize: 12,
                padding: "7px 12px 7px 32px",
              }}
            />
          </div>

          {/* Priority filter segmented */}
          <div className="segmented">
            {PRIORITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={priorityFilter === opt.value ? "active" : ""}
                onClick={() => setPriorityFilter(opt.value)}
                type="button"
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div style={{ flex: 1 }} />

          {/* New task CTA */}
          <button
            className="pill-btn pill-btn-accent"
            onClick={openCreate}
            style={{ fontSize: 12, padding: "7px 14px" }}
          >
            <IconPlus />
            New task
          </button>
        </div>

        {/* ── Stats strip ── */}
        <div
          className="stack-on-mobile"
          style={{
            display: "flex",
            gap: 10,
            padding: "14px 20px",
            flexShrink: 0,
          }}
        >
          {/* Total */}
          <div className="stat-card stat-pill" style={{ minWidth: 80 }}>
            <div>
              <div className="stat-value">{totalCount}</div>
              <div className="stat-label">Total</div>
            </div>
          </div>

          {/* Per-stage */}
          {STAGES.map((stage) => (
            <div className="stat-card stat-pill" key={stage.id} style={{ minWidth: 80 }}>
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: stage.color,
                  flexShrink: 0,
                }}
              />
              <div>
                <div className="stat-value">{groupedTasks[stage.id]?.length || 0}</div>
                <div className="stat-label">{stage.label}</div>
              </div>
            </div>
          ))}

          {/* Progress bar */}
          <div className="stat-card stat-pill" style={{ minWidth: 130, flex: 1, maxWidth: 200 }}>
            <div style={{ width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span className="stat-label">Progress</span>
                <span className="stat-value" style={{ fontSize: 13 }}>{progressPct}%</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: `${progressPct}%`,
                    background: "linear-gradient(135deg, #7c5cff 0%, #2ce0c6 100%)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Error banner ── */}
        {error && (
          <div
            style={{
              color: "var(--danger)",
              padding: "10px 20px",
              fontSize: 13,
              background: "rgba(255,93,108,0.08)",
              borderBottom: "1px solid rgba(255,93,108,0.2)",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* ── Board ── */}
        {loading ? (
          <div
            style={{
              padding: 24,
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: "var(--muted)",
              fontSize: 13,
            }}
          >
            <IconSpinner />
            Loading tasks…
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              gap: 14,
              padding: "0 20px 20px",
              flex: 1,
              overflow: "auto",
            }}
          >
            {STAGES.map((stage) => (
              <KanbanColumn
                key={stage.id}
                stage={stage}
                tasks={groupedTasks[stage.id] || []}
                onDragStart={setDraggedId}
                onDrop={() => handleDrop(stage.id)}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <ActivityFeed refreshKey={activityKey} />

      {modalOpen && (
        <TaskModal
          task={editingTask}
          onSave={handleSave}
          onClose={() => {
            setModalOpen(false);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
}