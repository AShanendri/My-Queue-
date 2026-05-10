import Branch from "../models/Branch.js";
import IndustryType from "../models/IndustryType.js";
import { errorResponse, successResponse } from "../utils/responseHelpers.js";
import { isSuperAdmin } from "../utils/scopeHelpers.js";
import { isValidObjectId, requireFields } from "../utils/validationHelpers.js";

const normalizeText = (value = "") => String(value || "").trim();

export const getIndustryTypes = async (req, res) => {
  try {
    const industryTypes = await IndustryType.find({ status: "active" })
      .sort({ name: 1 })
      .lean();

    return successResponse(res, 200, "Industry types fetched successfully", {
      count: industryTypes.length,
      industryTypes,
    });
  } catch (error) {
    console.error("getIndustryTypes error:", error);
    return errorResponse(res, 500, "Server error while fetching industry types", {
      error: error?.message || error,
    });
  }
};

export const createIndustryType = async (req, res) => {
  try {
    if (!req.user || !isSuperAdmin(req.user)) {
      return errorResponse(res, 403, "Only super_admin can create industry types");
    }

    const missingFields = requireFields(req.body, ["name", "unitLabel", "staffLabel", "clientLabel"]);
    if (missingFields.length > 0) {
      return errorResponse(res, 400, `Missing required fields: ${missingFields.join(", ")}`);
    }

    const name = normalizeText(req.body.name);
    const code = normalizeText(req.body.code || name).toLowerCase().replace(/\s+/g, "_");
    const description = normalizeText(req.body.description || "");
    const unitLabel = normalizeText(req.body.unitLabel);
    const staffLabel = normalizeText(req.body.staffLabel);
    const clientLabel = normalizeText(req.body.clientLabel);
    const status = normalizeText(req.body.status || "active").toLowerCase();

    const existing = await IndustryType.findOne({ $or: [{ name }, { code }] }).lean();
    if (existing) {
      return errorResponse(res, 409, "Industry type name or code already exists");
    }

    const newIndustryType = await IndustryType.create({ name, code, description, unitLabel, staffLabel, clientLabel, status });
    return successResponse(res, 201, "Industry type created successfully", {
      industryType: newIndustryType,
    });
  } catch (error) {
    console.error("createIndustryType error:", error);
    return errorResponse(res, 500, "Server error while creating industry type", {
      error: error?.message || error,
    });
  }
};

export const deleteIndustryType = async (req, res) => {
  try {
    if (!req.user || !isSuperAdmin(req.user)) {
      return errorResponse(res, 403, "Only super_admin can delete industry types");
    }

    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return errorResponse(res, 400, "Invalid industry type id");
    }

    const industryType = await IndustryType.findById(id);
    if (!industryType) {
      return errorResponse(res, 404, "Industry type not found");
    }

    const linkedBranchCount = await Branch.countDocuments({ industryType: industryType._id });
    if (linkedBranchCount > 0) {
      return errorResponse(res, 400, "Cannot delete industry type because existing branches reference it");
    }

    await IndustryType.deleteOne({ _id: id });
    return successResponse(res, 200, "Industry type deleted successfully");
  } catch (error) {
    console.error("deleteIndustryType error:", error);
    return errorResponse(res, 500, "Server error while deleting industry type", {
      error: error?.message || error,
    });
  }
};
