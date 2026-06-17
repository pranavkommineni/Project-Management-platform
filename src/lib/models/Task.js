import mongoose from "mongoose";

const StatusHistorySchema = new mongoose.Schema(
  {
    from: { type: String, default: null },
    to: { type: String, required: true },
    changedBy: { type: String, default: "system" },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const AttachmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    uploadedBy: { type: String, default: "system" },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title must be 200 characters or fewer"],
    },
    description: { type: String, trim: true, default: "" },

    project: { type: String, trim: true, default: "General", index: true },
    tags: { type: [String], default: [] },

    stage: {
      type: String,
      enum: ["todo", "inprogress", "done"],
      default: "todo",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
      index: true,
    },

    assignee: { type: String, trim: true, default: "", index: true },
    dueDate: { type: Date, default: null },

    estimatedHours: { type: Number, min: 0, default: 0 },
    completedPercentage: { type: Number, min: 0, max: 100, default: 0 },
    commentsCount: { type: Number, min: 0, default: 0 },

    attachments: { type: [AttachmentSchema], default: [] },

    createdBy: { type: String, trim: true, default: "system" },
    updatedBy: { type: String, trim: true, default: "system" },

    statusHistory: { type: [StatusHistorySchema], default: [] },
  },
  { timestamps: true }
);

// Supports multi-field search (title, description, assignee, tags)
TaskSchema.index({ title: "text", description: "text", assignee: "text", tags: "text" });

export default mongoose.models.Task || mongoose.model("Task", TaskSchema);