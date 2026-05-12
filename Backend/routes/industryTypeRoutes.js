import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  createIndustryType,
  deleteIndustryType,
  getIndustryTypes,
} from "../controllers/industryTypeController.js";

const industryTypeRouter = express.Router();

// Public list for customer home & kiosk flows (no JWT required)
industryTypeRouter.get("/", getIndustryTypes);
industryTypeRouter.post("/", authMiddleware, createIndustryType);
industryTypeRouter.delete("/:id", authMiddleware, deleteIndustryType);

export default industryTypeRouter;
