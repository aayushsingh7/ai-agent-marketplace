import { Router } from "express";
import WalletController from "../controllers/wallet.controller.js";
import authenticateUser from "../milddleware/authenticateUser.js";
const walletRoutes = Router();
const walletController = new WalletController();

walletRoutes.put("/buy-credits", authenticateUser, walletController.buyCredits);
walletRoutes.put("/mint", authenticateUser, walletController.createAgent);
walletRoutes.put("/buy-nft", authenticateUser, walletController.buyAgentNFT);

export default walletRoutes;
