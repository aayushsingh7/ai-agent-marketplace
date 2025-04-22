import Agent from "../database/models/agent.model.js";
import AgentService from "../services/agent.service.js";

class AgentController {
  constructor() {
    this.agentService = new AgentService();
    this.agent = Agent;
    this.searchAgents = this.searchAgents.bind(this);
    this.useAgentAPI = this.useAgentAPI.bind(this);
    this.createAgent = this.createAgent.bind(this);
    this.getAgent = this.getAgent.bind(this);
    this.getAgents = this.getAgents.bind(this);
    this.fetchOwnedNFTs = this.fetchOwnedNFTs.bind(this);
  }

  async getAgents(req, res) {
    try {
      const results = await this.agent.find().populate([
        {
          path: "owner",
          select: "username walletAddress",
        },
        {
          path: "creator",
          select: "username walletAddress",
        },
      ]);
      res.status(200).send({
        success: true,
        message: "Agents fetched successfully",
        data: results,
      });
    } catch (err) {
      res
        .status(500)
        .send({ success: false, message: "Oops! something went wrong" });
    }
  }
  async searchAgents(req, res) {
    try {
      const { query } = req.query;
      const results = await this.agentService.searchAgent(query);
      res.status(200).send({
        success: true,
        message: "Agents fetched successfully",
        data: results,
      });
    } catch (err) {
      res
        .status(err.statusCode)
        .send({ message: "Oops! something went wrong", success: false });
    }
  }

  async createAgent(req, res) {
    try {
      let agent = await this.createAgent(req.body);
      res.status(200).send({
        success: true,
        message: "New agent created successfully",
        data: agent,
      });
    } catch (err) {
      res
        .status(err.statusCode)
        .send({ success: false, message: "Oops! something went wrong" });
    }
  }

  async getAgent(req, res) {
    try {
      const { agentID } = req.params;
      const agent = await this.agentService.getAgent(agentID);
      res.status(200).send({
        success: true,
        message: "Agent fetched successfully",
        data: agent,
      });
    } catch (err) {
      res
        .status(err.statusCode)
        .send({ success: false, message: "Oops! something went wrong" });
    }
  }

  async useAgentAPI(req, res) {
    const { agentID } = req.query;

    if (!agentID) {
      return res
        .status(400)
        .send({ success: false, message: "agentID is required" });
    }

    if (!req.userID)
      return res
        .status(400)
        .send({ success: false, message: "User ID is not provided" });

    try {
      const originalAPI = await this.agentService.useAgent(
        req.creditID,
        agentID,
        req.requestType,
        req.userID
      );
      return res.redirect(originalAPI);
    } catch (err) {
      res.status(err.statusCode || 500).send({
        success: false,
        message: err.message,
      });
    }
  }

  async fetchOwnedNFTs(req, res) {
    try {
      const nfts = await this.agentService.fetchOwnedNFTs(req.userID);
      res
        .status(200)
        .send({
          success: true,
          message: "NFTs fetched successfully",
          data: nfts,
        });
    } catch (err) {
      res
        .status(err.statusCode || 500)
        .send({ success: false, message: err.message });
    }
  }
}

export default AgentController;
