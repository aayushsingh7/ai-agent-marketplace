import { Router } from "express";
import WalletController from "../controllers/wallet.controller.js";
const walletRoutes = Router();
const walletController = new WalletController()

// walletRoutes.get("/buy-credits")

export default walletRoutes;