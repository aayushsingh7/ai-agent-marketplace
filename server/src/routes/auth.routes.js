import { Router } from "express";
import AuthController from "../controllers/auth.controller.js";
const authRoutes = Router();
const authController = new AuthController()


authRoutes.get("/validate-hx-token", authController.validTransaction)

export default authRoutes;