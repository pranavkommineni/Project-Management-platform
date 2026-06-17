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

export default function KanbanBoard() {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] =
    useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] =
    useState(false);
  const [editingTask, setEditingTask] =
    useState(null);

  const [draggedId, setDraggedId] =
    useState(null);

  const [activityKey, setActivityKey] =
    useState(0);

  const searchTimeout = useRef(null);

  const refreshActivity = () => {
    setActivityKey((prev) => prev + 1);
  };

  const apiRequest = async (
    url,
    options = {}
  ) => {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });

    if (!response.ok) {
      let message = "Request failed";

      try {
        const err = await response.json();
        message =
          err.message ||
          err.error ||
          message;
      } catch {}

      throw new Error(message);
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  };

  const fetchTasks = useCallback(
    async (signal) => {
      try {
        setLoading(true);
        setError("");

        const params =
          new URLSearchParams();

        params.set("all", "true");

        if (search.trim()) {
          params.set(
            "search",
            search.trim()
          );
        }

        if (priorityFilter) {
          params.set(
            "priority",
            priorityFilter
          );
        }

        const response = await fetch(
          `/api/tasks?${params.toString()}`,
          {
            signal,
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch tasks (${response.status})`
          );
        }

        const data =
          await response.json();

        const taskList =
          Array.isArray(data)
            ? data
            : data.tasks || [];

        setTasks(taskList);
      } catch (err) {
        if (
          err.name !== "AbortError"
        ) {
          console.error(err);
          setError(
            err.message ||
              "Failed to load tasks"
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [search, priorityFilter]
  );

  useEffect(() => {
    const controller =
      new AbortController();

    fetchTasks(controller.signal);

    return () =>
      controller.abort();
  }, [fetchTasks]);

  const handleSearch = (value) => {
    if (searchTimeout.current) {
      clearTimeout(
        searchTimeout.current
      );
    }

    searchTimeout.current =
      setTimeout(() => {
        setSearch(value);
      }, 300);
  };

  const handleSave = async (
    taskData
  ) => {
    try {
      setError("");

      if (editingTask?._id) {
        await apiRequest(
          `/api/tasks/${editingTask._id}`,
          {
            method: "PATCH",
            body: JSON.stringify(
              taskData
            ),
          }
        );
      } else {
        await apiRequest(
          "/api/tasks",
          {
            method: "POST",
            body: JSON.stringify(
              taskData
            ),
          }
        );
      }

      await fetchTasks();

      setModalOpen(false);
      setEditingTask(null);

      refreshActivity();
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Failed to save task"
      );
    }
  };

  const handleDelete = async (
    id
  ) => {
    const confirmed =
      window.confirm(
        "Delete this task?"
      );

    if (!confirmed) return;

    try {
      await apiRequest(
        `/api/tasks/${id}`,
        {
          method: "DELETE",
        }
      );

      setTasks((prev) =>
        prev.filter(
          (task) =>
            task._id !== id
        )
      );

      refreshActivity();
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Failed to delete task"
      );
    }
  };

  const handleDrop = async (
    stage
  ) => {
    if (!draggedId) return;

    try {
      await apiRequest(
        `/api/tasks/${draggedId}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            stage,
          }),
        }
      );

      setTasks((prev) =>
        prev.map((task) =>
          task._id === draggedId
            ? {
                ...task,
                stage,
              }
            : task
        )
      );

      refreshActivity();
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Failed to move task"
      );
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

  const groupedTasks = useMemo(
    () => ({
      todo: tasks.filter(
        (task) =>
          task.stage === "todo"
      ),
      inprogress: tasks.filter(
        (task) =>
          task.stage ===
          "inprogress"
      ),
      done: tasks.filter(
        (task) =>
          task.stage === "done"
      ),
    }),
    [tasks]
  );

  return (
    <div
      style={{
        display: "flex",
        height:
          "calc(100vh - 64px)",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection:
            "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background:
              "var(--surface)",
            borderBottom:
              "1px solid var(--border)",
            padding:
              "16px 24px",
            display: "flex",
            gap: 12,
            alignItems:
              "center",
            flexShrink: 0,
          }}
        >
          <input
            type="text"
            placeholder="Search tasks..."
            defaultValue={search}
            onChange={(e) =>
              handleSearch(
                e.target.value
              )
            }
            style={{
              flex: 1,
              maxWidth: 320,
            }}
          />

          <select
            value={priorityFilter}
            onChange={(e) =>
              setPriorityFilter(
                e.target.value
              )
            }
          >
            <option value="">
              All Priorities
            </option>
            <option value="high">
              🔴 High
            </option>
            <option value="medium">
              🟡 Medium
            </option>
            <option value="low">
              ⚪ Low
            </option>
          </select>

          <button
            onClick={openCreate}
            style={{
              background:
                "var(--accent)",
              color: "#fff",
              padding:
                "10px 16px",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            + New Task
          </button>
        </div>

        {error && (
          <div
            style={{
              color: "#ef4444",
              padding: 12,
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div
            style={{
              padding: 24,
            }}
          >
            Loading tasks...
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              gap: 16,
              padding: 24,
              flex: 1,
              overflow: "auto",
            }}
          >
            {STAGES.map(
              (stage) => (
                <KanbanColumn
                  key={
                    stage.id
                  }
                  stage={stage}
                  tasks={
                    groupedTasks[
                      stage.id
                    ] || []
                  }
                  onDragStart={
                    setDraggedId
                  }
                  onDrop={() =>
                    handleDrop(
                      stage.id
                    )
                  }
                  onEdit={
                    openEdit
                  }
                  onDelete={
                    handleDelete
                  }
                />
              )
            )}
          </div>
        )}
      </div>

      <ActivityFeed
        refreshKey={
          activityKey
        }
      />

      {modalOpen && (
        <TaskModal
          task={
            editingTask
          }
          onSave={
            handleSave
          }
          onClose={() => {
            setModalOpen(
              false
            );
            setEditingTask(
              null
            );
          }}
        />
      )}
    </div>
  );
}