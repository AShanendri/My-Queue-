import express from "express";
import { loginUser, registerUser } from "../controllers/userController.js";
import { getRedirectInfo } from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const authRouter = express.Router();

authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.get("/redirect", authMiddleware, getRedirectInfo);

export default authRouter;
