import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Task from "@/lib/models/Task";
import Activity from "@/lib/models/Activity";

// PATCH /api/tasks/:id — edit or move stage
export async function PATCH(request, { params }) {
  await connectDB();
  const { id } = await params;
  const body = await request.json();

  const old = await Task.findById(id);
  if (!old) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await Task.findByIdAndUpdate(id, body, { new: true });

  // Log stage moves
  if (body.stage && body.stage !== old.stage) {
    await Activity.create({
      action: "moved",
      taskTitle: old.title,
      detail: `${old.stage} → ${body.stage}`,
    });
  }

  return NextResponse.json(updated);
}

// DELETE /api/tasks/:id
export async function DELETE(_, { params }) {
  await connectDB();
  const { id } = await params;
  const task = await Task.findByIdAndDelete(id);

  if (task) {
    await Activity.create({
      action: "deleted",
      taskTitle: task.title,
      detail: "",
    });
  }

  return NextResponse.json({ success: true });
}
