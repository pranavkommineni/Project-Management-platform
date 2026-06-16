import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import Activity from "../../../lib/models/Activity";

// GET /api/activity — last 30 events
export async function GET() {
  await connectDB();
  const logs = await Activity.find().sort({ createdAt: -1 }).limit(30);
  return NextResponse.json(logs);
}
