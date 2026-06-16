import mongoose from "mongoose";

const ActivitySchema = new mongoose.Schema(
  {
    action: { type: String, required: true }, // e.g. "moved", "created", "deleted"
    taskTitle: { type: String, required: true },
    detail: { type: String, default: "" },    // e.g. "todo → inprogress"
  },
  { timestamps: true }
);

export default mongoose.models.Activity ||
  mongoose.model("Activity", ActivitySchema);
