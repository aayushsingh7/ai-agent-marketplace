import WalletService from "../services/wallet.service.js";
import minterWallet from "../utils/mintingSerivce.js";

class WalletController {
  constructor() {
    this.walletService = new WalletService();
    this.confirmCreditPurchase = this.confirmCreditPurchase.bind(this);
    this.confirmNFTPurchase = this.confirmNFTPurchase.bind(this);
    this.prepareBuyCredits = this.prepareBuyCredits.bind(this);
    this.prepareBuyNFT = this.prepareBuyNFT.bind(this);
    this.createAgent = this.createAgent.bind(this);
    this.prepareUpdateAgent = this.prepareUpdateAgent.bind(this);
    this.confirmAgentUpdate = this.confirmAgentUpdate.bind(this);
    this.getAgentCreditCost = this.getAgentCreditCost.bind(this);
  }


  async createAgent(req, res) {
  
    const { recipient, agentData, gasLimit } = req.body;
    try {
      const agent = await this.walletService.createAgent(
        minterWallet,
        recipient,
        agentData,
        gasLimit
      );

      res
        .status(200)
        .send({ success: true, message: "New agent minted", data: agent });
    } catch (err) {
      res.status(err.statusCode).send({ success: false, message: err.message });
    }
  }


  async prepareBuyCredits(req, res) {
    try {
      const { agentID, tokenID, creditAmount, walletAddress } = req.body;
      const txData = await this.walletService.prepareBuyCredits(
        agentID,
        tokenID,
        creditAmount,
        walletAddress
      );

      res.status(200).send({
        success: true,
        message: "Preparation completed",
        data: txData,
      });
    } catch (err) {
      res.status(err.statusCode || 500).send({
        success: false,
        message: "Oops! something went wrong",
        errMsg: err.message,
      });
    }
  }

  async confirmCreditPurchase(req, res) {
    try {
      const {
        transactionHash,
        agentID,
        tokenID,
        creditAmount,
        walletAddress,
        gasFee,
        gasFeeInEth,
      } = req.body;

      const result = await this.walletService.recordCreditPurchase(
        transactionHash,
        agentID,
        tokenID,
        creditAmount,
        walletAddress,
        gasFee,
        gasFeeInEth
      );

      res.status(200).send({
        success: true,
        message: "Transaction completed successfully",
        data: result,
      });
    } catch (error) {
      res.status(error.statusCode || 500).send({
        success: false,
        message: "Oops! something went wrong",
        error: error.message,
      });
    }
  }

  async prepareBuyNFT(req, res) {
    try {
      const { agentID, tokenID, walletAddress } = req.body;

      const txData = await this.walletService.prepareBuyAgentNFT(
        agentID,
        tokenID,
        walletAddress
      );

      res.status(200).send({
        success: true,
        message: "Preparation completed",
        data: txData,
      });
    } catch (error) {
      res.status(error.statusCode || 500).send({
        success: false,
        message: "Oops! something went wrong",
        error: error.message,
      });
    }
  }

  async confirmNFTPurchase(req, res) {
    try {
      const { transactionHash, agentID, walletAddress, gasFee, gasFeeInEth } =
        req.body;

      const result = await this.walletService.recordNFTPurchase(
        transactionHash,
        agentID,
        walletAddress,
        gasFee,
        gasFeeInEth
      );

      res.status(200).send({
        success: true,
        message: "NFT purchased completed",
        data: result,
      });
    } catch (error) {
      res.status(error.statusCode || 500).send({
        success: false,
        message: "Oops! something went wrong",
        error: error.message,
      });
    }
  }

  async prepareUpdateAgent(req, res) {
    try {
      const {
        agentID,
        tokenID,
        newCreditCost,
        newSalePrice,
        forSale,
        walletAddress,
      } = req.body;

      const txData = await this.walletService.prepareUpdateAgent(
        agentID,
        tokenID,
        newCreditCost,
        newSalePrice,
        forSale,
        walletAddress
      );

      res.status(200).json({
        success: true,
        message: "Transaction prepared successfully",
        data: txData,
      });
    } catch (err) {
      console.error("Prepare update agent API error:", err);
      res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Failed to prepare transaction",
      });
    }
  }

  async confirmAgentUpdate(req, res) {
    try {
      const {
        transactionHash,
        agentID,
        tokenID,
        newCreditCost,
        newSalePrice,
        forSale,
        walletAddress,
        gasFee,
        gasFeeInEth,
      } = req.body;

      const result = await this.walletService.confirmAgentUpdate(
        transactionHash,
        agentID,
        tokenID,
        newCreditCost,
        newSalePrice,
        forSale,
        walletAddress,
        gasFee,
        gasFeeInEth
      );

      res.status(200).json({
        success: true,
        message: "Agent update confirmed successfully",
        data: result,
      });
    } catch (err) {
      console.error("Confirm agent update API error:", err);
      res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Failed to confirm update",
      });
    }
  }

  async getAgentCreditCost(req,res) {
    const {tokenID} = req.query;
    try {
      const creditCost = await this.walletService.getAgentCreditCost(tokenID);
      res.status(200).send({success:true,message:"Credit cost fetched successfully", data:creditCost})
    } catch (error) {
      console.error('Error getting agent credit cost:', error);
      throw error;
    }
  }
}

export default WalletController;
