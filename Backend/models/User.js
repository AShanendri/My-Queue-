import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    username: {
      type: String,
      trim: true,
      default: "",
    },

    role: {
      type: String,
      enum: [
        "user",
        "customer",
        "super_admin",
        "organization_admin",
        "industry_admin",
        "branch_admin",
        "staff",
        "hospital_super_admin",
        "police_super_admin",
        "company_super_admin",
        "police_division_admin",
        "police_branch_admin",
        "police_staff",
      ],
      required: true,
    },

    tenantType: {
      type: String,
      enum: ["police", "hospital", "bank", "supermarket", "company"],
      default: null,
      trim: true,
      lowercase: true,
      required: function () {
        const role = String(this.role || "").trim().toLowerCase();
        return !["user", "customer"].includes(role);
      },
    },

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      required: function () {
        const role = String(this.role || "").trim().toLowerCase();
        return ["organization_admin", "industry_admin", "branch_admin", "staff"].includes(role);
      },
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
      required: function () {
        return false;
      },
    },

    divisionName: {
      type: String,
      default: null,
      trim: true,
    },

    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      required: function () {
        const role = String(this.role || "").trim().toLowerCase();
        return ["branch_admin", "staff"].includes(role);
      },
    },

    branchName: {
      type: String,
      default: null,
      trim: true,
      required: function () {
        const role = String(this.role || "").trim().toLowerCase();
        return ["branch_admin", "staff"].includes(role);
      },
    },

    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "active",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;