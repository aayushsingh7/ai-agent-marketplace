import WalletService from "../services/wallet.service.js";

class WalletController {
  constructor() {
    this.walletService = new WalletService();
    this.buyCredits = this.buyCredits.bind(this);
    this.buyAgentNFT = this.buyAgentNFT.bind(this);
    this.createAgent = this.createAgent.bind(this);
    this.updateAgentInfo = this.updateAgentInfo.bind(this);
  }

  async buyCredits(req, res) {
    const { wallet, tokenId, seiAmount, agentID } = req.body;
    try {
      let result = await this.walletService.buyCredits(
        wallet,
        tokenId,
        seiAmount,
        agentID
      );
      res.status(200).send({
        success: true,
        message: "Transaction completed successfully",
        data: result,
      });
    } catch (err) {
      res.status(err.statusCode).send({ success: false, message: err.message });
    }
  }

  async buyAgentNFT(req, res) {
    const { wallet, tokenId, agentID } = req.body;
    try {
      const result = await this.walletService.buyAgentNFT(
        wallet,
        tokenId,
        agentID
      );
      res.status(200).send({
        success: true,
        message: "Transaction completed successfully",
        data: result,
      });
    } catch (err) {
      res.status(err.statusCode).send({ success: false, message: err.message });
    }
  }

  async createAgent(req, res) {
    const {
      wallet,
      recipient,
      agentData,
      creditCost,
      salePrice,
      forSale,
      gasLimit,
    } = req.body;
    try {
      const agent = await this.walletService.createAgent(
        wallet,
        recipient,
        (agentData = {}),
        creditCost,
        salePrice,
        forSale,
        gasLimit
      );

      res
        .status(200)
        .send({ success: true, message: "New agent minted", data: agent });
    } catch (err) {
      res.status(err.statusCode).send({ success: false, message: err.message });
    }
  }

  async updateAgentInfo(req, res) {
    try {
    } catch (err) {
      res.status(err.statusCode).send({ success: false, message: err.message });
    }
  }
}

export default WalletController;
