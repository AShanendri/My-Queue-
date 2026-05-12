import express from "express";
import {
	createBranchAdmin,
	createCompanyBranchAdmin,
	createCompanyBranchStaffUser,
	createCompanyOrganizationAdmin,
	createHospitalBranchAdmin,
	createHospitalOrganizationAdmin,
	createHospitalStaffUser,
	createOrganizationAdmin,
	createStaffUser,
	getAllUsers,
	getUsers,
	loginUser,
	registerUser,
} from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizationMiddleware.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

// Common multi-tenant user endpoints.
userRouter.post(
	"/organization-admins",
	authMiddleware,
	authorizeRoles("super_admin", "hospital_super_admin", "police_super_admin", "company_super_admin"),
	createOrganizationAdmin
);
userRouter.post(
	"/branch-admins",
	authMiddleware,
	authorizeRoles(
		"super_admin",
		"hospital_super_admin",
		"police_super_admin",
		"company_super_admin",
		"organization_admin"
	),
	createBranchAdmin
);
userRouter.post(
	"/staff",
	authMiddleware,
	authorizeRoles(
		"super_admin",
		"hospital_super_admin",
		"police_super_admin",
		"company_super_admin",
		"organization_admin",
		"branch_admin"
	),
	createStaffUser
);
userRouter.get(
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
	getUsers
);

// Legacy aliases kept for migration safety.
userRouter.get("/list", authMiddleware, getAllUsers);
userRouter.post("/company/organization-admins", authMiddleware, createCompanyOrganizationAdmin);
userRouter.post("/company/branch-admins", authMiddleware, createCompanyBranchAdmin);
userRouter.post("/company/staff", authMiddleware, createCompanyBranchStaffUser);
userRouter.post("/hospital/organization-admins", authMiddleware, createHospitalOrganizationAdmin);
userRouter.post("/hospital/branch-admins", authMiddleware, createHospitalBranchAdmin);
userRouter.post("/hospital/staff", authMiddleware, createHospitalStaffUser);

// Optional police aliases during migration; all call the same common controllers.
userRouter.post("/police/organization-admins", authMiddleware, createOrganizationAdmin);
userRouter.post("/police/branch-admins", authMiddleware, createBranchAdmin);
userRouter.post("/police/staff", authMiddleware, createStaffUser);

export default userRouter;