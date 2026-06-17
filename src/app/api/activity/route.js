import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import Activity from "../../../lib/models/Activity";

/* ---------------------------------------------------------
   GET /api/activity
   Supports: page, limit, action, user, taskId, from, to
   --------------------------------------------------------- */
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10) || 20));

    const action = searchParams.get("action");
    const user = searchParams.get("user");
    const taskId = searchParams.get("taskId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const query = {};
    if (action) query.action = action;
    if (user) query.user = user;
    if (taskId) query.task = taskId;
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      Activity.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Activity.countDocuments(query),
    ]);

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (err) {
    console.error("[api/activity][GET]", err);
    return NextResponse.json(
      { error: "Failed to fetch activity", detail: err.message },
      { status: 500 }
    );
  }
}