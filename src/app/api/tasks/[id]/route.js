import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "../../../../lib/mongodb";
import Task from "../../../../lib/models/Task";
import Activity from "../../../../lib/models/Activity";

const EDITABLE_FIELDS = [
  "title",
  "description",
  "project",
  "stage",
  "priority",
  "assignee",
  "tags",
  "dueDate",
  "estimatedHours",
  "completedPercentage",
  "commentsCount",
  "attachments",
];

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

/* ---------------------------------------------------------
   GET /api/tasks/[id]
   --------------------------------------------------------- */
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    if (!isValidId(id)) {
      return NextResponse.json({ error: "Invalid task id" }, { status: 400 });
    }

    const task = await Task.findById(id).lean();
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (err) {
    console.error("[api/tasks/[id]][GET]", err);
    return NextResponse.json(
      { error: "Failed to fetch task", detail: err.message },
      { status: 500 }
    );
  }
}

/* ---------------------------------------------------------
   PATCH /api/tasks/[id]
   Partial update + diff-based activity / audit trail logging
   --------------------------------------------------------- */
export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    if (!isValidId(id)) {
      return NextResponse.json({ error: "Invalid task id" }, { status: 400 });
    }

    const body = await request.json();

    if (body.title !== undefined && !body.title.trim()) {
      return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
    }

    const existing = await Task.findById(id);
    if (!existing) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const actor = body.updatedBy || "system";
    const setFields = {};
    const changes = [];

    for (const field of EDITABLE_FIELDS) {
      if (body[field] === undefined) continue;
      const oldVal = existing[field];
      const newVal = body[field];
      const changed = JSON.stringify(oldVal) !== JSON.stringify(newVal);
      if (changed) {
        changes.push({ field, oldVal, newVal });
        setFields[field] = newVal;
      }
    }

    if (changes.length === 0) {
      return NextResponse.json(existing);
    }

    let pushOp = null;
    if (setFields.stage && setFields.stage !== existing.stage) {
      pushOp = {
        statusHistory: { from: existing.stage, to: setFields.stage, changedBy: actor },
      };
      if (setFields.stage === "done" && setFields.completedPercentage === undefined) {
        setFields.completedPercentage = 100;
      }
    }

    setFields.updatedBy = actor;

    const updateOps = { $set: setFields };
    if (pushOp) updateOps.$push = pushOp;

    const updated = await Task.findByIdAndUpdate(id, updateOps, {
      new: true,
      runValidators: true,
    });

    const stageChange = changes.find((c) => c.field === "stage");
    const action = stageChange ? "moved" : "updated";
    const detail = stageChange
      ? `Moved from ${stageChange.oldVal} to ${stageChange.newVal}`
      : `Updated ${changes.map((c) => c.field).join(", ")}`;

    await Activity.create({
      task: updated._id,
      taskTitle: updated.title,
      action,
      actionType: "task",
      user: actor,
      detail,
      oldValue: Object.fromEntries(changes.map((c) => [c.field, c.oldVal])),
      newValue: Object.fromEntries(changes.map((c) => [c.field, c.newVal])),
      ipAddress: request.headers.get("x-forwarded-for") || "",
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[api/tasks/[id]][PATCH]", err);
    if (err.name === "ValidationError") {
      return NextResponse.json(
        { error: "Validation failed", detail: err.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update task", detail: err.message },
      { status: 500 }
    );
  }
}

/* ---------------------------------------------------------
   DELETE /api/tasks/[id]
   --------------------------------------------------------- */
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    if (!isValidId(id)) {
      return NextResponse.json({ error: "Invalid task id" }, { status: 400 });
    }

    const task = await Task.findByIdAndDelete(id);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const actor = searchParams.get("by") || "system";

    await Activity.create({
      task: task._id,
      taskTitle: task.title,
      action: "deleted",
      actionType: "task",
      user: actor,
      detail: `Deleted from ${task.stage}`,
      oldValue: { stage: task.stage },
      ipAddress: request.headers.get("x-forwarded-for") || "",
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/tasks/[id]][DELETE]", err);
    return NextResponse.json(
      { error: "Failed to delete task", detail: err.message },
      { status: 500 }
    );
  }
}