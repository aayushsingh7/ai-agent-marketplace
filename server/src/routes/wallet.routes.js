import { Router } from "express";
import WalletController from "../controllers/wallet.controller.js";
import authenticateUser from "../milddleware/authenticateUser.js";
const walletRoutes = Router();
const walletController = new WalletController();

walletRoutes.get("/get-agent-credit-cost", walletController.getAgentCreditCost)
walletRoutes.put("/mint", authenticateUser, walletController.createAgent);
walletRoutes.post("/prepare-buy-credits",authenticateUser, walletController.prepareBuyCredits)
walletRoutes.post("/confirm-credit-purchase",authenticateUser,walletController.confirmCreditPurchase)
walletRoutes.post("/prepare-buy-nft",authenticateUser,walletController.prepareBuyNFT)
walletRoutes.post("/confirm-nft-purchase", authenticateUser,walletController.confirmNFTPurchase)
walletRoutes.post("/prepare-update-agent", authenticateUser, walletController.prepareUpdateAgent)
walletRoutes.post("/confirm-agent-update", authenticateUser, walletController.confirmAgentUpdate)

export default walletRoutes;
