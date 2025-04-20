import { Router } from "express";
import AuthController from "../controllers/auth.controller.js";
const authRoutes = Router();
const authController = new AuthController();

authRoutes.get("/nonce", authController.generateNonce);
authRoutes.get("/verify-signature", authController.verifySignature);

export default authRoutes;
