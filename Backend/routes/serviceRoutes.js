import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  createService,
  getBranchServices,
  getPublicBranchServices,
  getServices,
  updateService,
} from "../controllers/serviceController.js";

const serviceRouter = express.Router();

serviceRouter.get("/public/branches/:branchId/services", getPublicBranchServices);
serviceRouter.post("/", authMiddleware, createService);
serviceRouter.get("/", authMiddleware, getServices);
serviceRouter.get("/branches/:branchId/services", authMiddleware, getBranchServices);
serviceRouter.patch("/:id", authMiddleware, updateService);

export default serviceRouter;
