import mongoose from "mongoose";

const branchSchema = new mongoose.Schema(
  {
    tenantType: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    industryType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IndustryType",
      required: true,
      index: true,
    },

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    organizationName: {
      type: String,
      default: null,
      trim: true,
    },

    divisionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      default: null,
    },

    divisionName: {
      type: String,
      default: null,
      trim: true,
    },

    branchName: {
      type: String,
      required: true,
      trim: true,
    },

    shortName: {
      type: String,
      default: "",
      trim: true,
    },

    branchCode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      default: null,
    },

    city: {
      type: String,
      default: "",
      trim: true,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    contactNumber: {
      type: String,
      default: "",
      trim: true,
    },

    email: {
      type: String,
      default: "",
      lowercase: true,
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

    branchAdminAccess: {
      type: Boolean,
      default: false,
    },

    isMain: {
      type: Boolean,
      default: false,
    },
    services: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        default: [] 
      }
    ],
  },
  { timestamps: true }
);

branchSchema.pre("validate", function () {
  if (String(this.tenantType || "").trim().toLowerCase() !== "police" && !this.organizationId) {
    throw new Error("Non-police branches require organizationId");
  }
});

// Indexes for efficient tenant-scoped queries
branchSchema.index({ tenantType: 1, divisionId: 1 });
branchSchema.index({ tenantType: 1, organizationId: 1 });
branchSchema.index({ createdAt: -1 });
branchSchema.index(
  { tenantType: 1, divisionId: 1, isMain: 1 },
  { unique: true, partialFilterExpression: { tenantType: "police", isMain: true } }
);

const Branch = mongoose.model("Branch", branchSchema);

export default Branch;