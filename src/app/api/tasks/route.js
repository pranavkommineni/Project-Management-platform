import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import Task from "../../../lib/models/Task";
import Activity from "../../../lib/models/Activity";

const ALLOWED_SORT_FIELDS = [
  "createdAt",
  "updatedAt",
  "dueDate",
  "priority",
  "title",
  "completedPercentage",
];

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parsePagination(searchParams) {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10) || 50));
  return { page, limit, skip: (page - 1) * limit };
}

/* ---------------------------------------------------------
   GET /api/tasks
   Supports: search, priority, stage, assignee, project, tag,
   dueBefore, dueAfter, sortBy, sortDir, page, limit, all
   --------------------------------------------------------- */
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim();
    const priority = searchParams.get("priority");
    const stage = searchParams.get("stage");
    const assignee = searchParams.get("assignee");
    const project = searchParams.get("project");
    const tag = searchParams.get("tag");
    const dueBefore = searchParams.get("dueBefore");
    const dueAfter = searchParams.get("dueAfter");

    const sortByRaw = searchParams.get("sortBy") || "createdAt";
    const sortBy = ALLOWED_SORT_FIELDS.includes(sortByRaw) ? sortByRaw : "createdAt";
    const sortDir = searchParams.get("sortDir") === "asc" ? 1 : -1;

    const query = {};

    // Search across multiple fields (title, description, assignee, tags)
    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");
      query.$or = [
        { title: regex },
        { description: regex },
        { assignee: regex },
        { tags: regex },
      ];
    }

    if (priority) query.priority = priority;
    if (stage) query.stage = stage;
    if (assignee) query.assignee = new RegExp(escapeRegex(assignee), "i");
    if (project) query.project = project;
    if (tag) query.tags = tag;

    if (dueBefore || dueAfter) {
      query.dueDate = {};
      if (dueAfter) query.dueDate.$gte = new Date(dueAfter);
      if (dueBefore) query.dueDate.$lte = new Date(dueBefore);
    }

    const noPagination = searchParams.get("all") === "true";
    const { page, limit, skip } = parsePagination(searchParams);

    let tasksQuery = Task.find(query).sort({ [sortBy]: sortDir });
    if (!noPagination) {
      tasksQuery = tasksQuery.skip(skip).limit(limit);
    }

    const [tasks, total] = await Promise.all([
      tasksQuery.lean(),
      Task.countDocuments(query),
    ]);

    if (noPagination) {
      // Board view: caller wants the full filtered set to group into columns.
      // (Note: string-sort on "priority" is alphabetical, not severity-ordered -
      // clients that care about true high->low ordering should re-sort client-side.)
      return NextResponse.json(tasks);
    }

    return NextResponse.json({
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (err) {
    console.error("[api/tasks][GET]", err);
    return NextResponse.json(
      { error: "Failed to fetch tasks", detail: err.message },
      { status: 500 }
    );
  }
}

/* ---------------------------------------------------------
   POST /api/tasks
   Creates a task, validates input, logs a "created" activity
   --------------------------------------------------------- */
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    if (!body.title || !body.title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const stage = ["todo", "inprogress", "done"].includes(body.stage) ? body.stage : "todo";
    let completedPercentage = Number(body.completedPercentage) || 0;
    if (stage === "done" && completedPercentage === 0) completedPercentage = 100;

    const actor = body.createdBy || "system";

    const task = await Task.create({
      title: body.title.trim(),
      description: body.description?.trim() || "",
      project: body.project?.trim() || "General",
      stage,
      priority: ["low", "medium", "high"].includes(body.priority) ? body.priority : "medium",
      assignee: body.assignee?.trim() || "",
      tags: Array.isArray(body.tags) ? body.tags.filter(Boolean) : [],
      dueDate: body.dueDate || null,
      estimatedHours: Number(body.estimatedHours) || 0,
      completedPercentage,
      attachments: Array.isArray(body.attachments) ? body.attachments : [],
      createdBy: actor,
      updatedBy: actor,
      statusHistory: [{ to: stage, changedBy: actor }],
    });

    await Activity.create({
      task: task._id,
      taskTitle: task.title,
      action: "created",
      actionType: "task",
      user: actor,
      detail: `Created in ${task.stage}`,
      newValue: { stage: task.stage, priority: task.priority },
      ipAddress: request.headers.get("x-forwarded-for") || "",
    });

    return NextResponse.json(task, { status: 201 });
  } catch (err) {
    console.error("[api/tasks][POST]", err);
    if (err.name === "ValidationError") {
      return NextResponse.json(
        { error: "Validation failed", detail: err.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create task", detail: err.message },
      { status: 500 }
    );
  }
}