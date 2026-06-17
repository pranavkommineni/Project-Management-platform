import mongoose from "mongoose";

const ActivitySchema = new mongoose.Schema(
  {
    task: { type: mongoose.Schema.Types.ObjectId, ref: "Task", index: true },
    taskTitle: { type: String, required: true },

    action: {
      type: String,
      enum: ["created", "updated", "moved", "deleted", "commented"],
      required: true,
      index: true,
    },
    actionType: { type: String, default: "task" }, // e.g. "task", "comment", "attachment"

    user: { type: String, default: "system", index: true },
    detail: { type: String, default: "" },

    oldValue: { type: mongoose.Schema.Types.Mixed, default: null },
    newValue: { type: mongoose.Schema.Types.Mixed, default: null },

    ipAddress: { type: String, default: "" },
  },
  { timestamps: true }
);

ActivitySchema.index({ createdAt: -1 });

export default mongoose.models.Activity || mongoose.model("Activity", ActivitySchema);