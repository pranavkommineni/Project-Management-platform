import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import Task from "../../../lib/models/Task";
import Activity from "../../../lib/models/Activity";

// GET /api/tasks  — optional ?search=&priority=&stage=
export async function GET(request) {
  await connectDB();

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const priority = searchParams.get("priority") || "";
  const stage = searchParams.get("stage") || "";

  const query = {};
  if (search) query.title = { $regex: search, $options: "i" };
  if (priority) query.priority = priority;
  if (stage) query.stage = stage;

  const tasks = await Task.find(query).sort({ createdAt: -1 });
  return NextResponse.json(tasks);
}

// POST /api/tasks  — create a task
export async function POST(request) {
  await connectDB();
  const body = await request.json();

  const task = await Task.create(body);

  await Activity.create({
    action: "created",
    taskTitle: task.title,
    detail: `Added to ${task.stage}`,
  });

  return NextResponse.json(task, { status: 201 });
}
