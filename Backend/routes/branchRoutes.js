import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizationMiddleware.js";
import {
	createBranch,
	createCompanyBranch,
	createHospitalBranch,
	getBranchById,
	getBranchesByOrganization,
	getPublicBranches,
	getBranches,
	updateBranch,
	createWard,
	getWards,
	getWardsByBranch,
	getPublicWardsByBranch,
	deleteWard,
} from "../controllers/branchController.js";

const branchRouter = express.Router();

branchRouter.get("/list/public", getPublicBranches);
branchRouter.get("/public/list", getBranchesByOrganization);
// Public wards/counters for customer queue booking (no JWT)
branchRouter.get("/wards/public/:branchId", getPublicWardsByBranch);
branchRouter.post(
	"/",
	authMiddleware,
	authorizeRoles("super_admin", "hospital_super_admin", "police_super_admin", "company_super_admin", "organization_admin"),
	createBranch
);
branchRouter.get(
	"/",
	authMiddleware,
	authorizeRoles(
		"super_admin",
		"hospital_super_admin",
		"police_super_admin",
		"company_super_admin",
		"organization_admin",
		"branch_admin",
		"staff"
	),
	getBranches
);
branchRouter.get(
	"/wards",
	authMiddleware,
	authorizeRoles(
		"super_admin",
		"hospital_super_admin",
		"police_super_admin",
		"company_super_admin",
		"organization_admin",
		"branch_admin",
		"staff"
	),
	getWards
);
branchRouter.get(
	"/:id",
	authMiddleware,
	authorizeRoles(
		"super_admin",
		"hospital_super_admin",
		"police_super_admin",
		"company_super_admin",
		"organization_admin",
		"branch_admin",
		"staff"
	),
	getBranchById
);
branchRouter.patch(
	"/:id",
	authMiddleware,
	authorizeRoles(
		"super_admin",
		"hospital_super_admin",
		"police_super_admin",
		"company_super_admin",
		"organization_admin",
		"branch_admin"
	),
	updateBranch
);

// Legacy aliases kept for migration safety.
branchRouter.post("/hospital", authMiddleware, authorizeRoles("super_admin", "hospital_super_admin", "organization_admin"), createHospitalBranch);
branchRouter.post("/company", authMiddleware, authorizeRoles("super_admin", "company_super_admin", "organization_admin"), createCompanyBranch);

// Ward endpoints
branchRouter.post(
	"/:branchId/wards",
	authMiddleware,
	authorizeRoles("super_admin", "hospital_super_admin", "police_super_admin", "company_super_admin", "organization_admin", "branch_admin"),
	createWard
);
branchRouter.get(
	"/:branchId/wards",
	authMiddleware,
	authorizeRoles(
		"super_admin",
		"hospital_super_admin",
		"police_super_admin",
		"company_super_admin",
		"organization_admin",
		"branch_admin",
		"staff"
	),
	getWardsByBranch
);
branchRouter.delete(
	"/wards/:id",
	authMiddleware,
	authorizeRoles(
		"super_admin",
		"hospital_super_admin",
		"police_super_admin",
		"company_super_admin",
		"organization_admin",
		"branch_admin"
	),
	deleteWard
);

export default branchRouter;
