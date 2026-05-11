import mongoose from "mongoose";

const wardSchema = new mongoose.Schema(
  {
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    createdBy: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Index for efficient branch-scoped queries
wardSchema.index({ branchId: 1, status: 1 });
wardSchema.index({ branchId: 1, createdAt: -1 });

const Ward = mongoose.model("Ward", wardSchema);

export default Ward;
