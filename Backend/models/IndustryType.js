import mongoose from "mongoose";

const industryTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    unitLabel: {
      type: String,
      required: true,
      trim: true,
    },
    staffLabel: {
      type: String,
      required: true,
      trim: true,
    },
    clientLabel: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      trim: true,
      lowercase: true,
    },
  },
  { timestamps: true }
);

industryTypeSchema.pre("validate", function () {
  if (this.name && !this.code) {
    this.code = String(this.name || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");
  }
});



const IndustryType = mongoose.model("IndustryType", industryTypeSchema);

export default IndustryType;
