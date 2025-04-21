import { Router } from "express";
import AuthController from "../controllers/auth.controller.js";
import authenticateUser from "../milddleware/authenticateUser.js";
const authRoutes = Router();
const authController = new AuthController();

authRoutes.get("/nonce", authController.generateNonce);
authRoutes.get("/verify-signature", authController.verifySignature);
authRoutes.get("/verify", authenticateUser, authController.getLoggedInUser)

export default authRoutes;
