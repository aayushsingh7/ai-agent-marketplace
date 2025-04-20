import AgentService from "../services/agent.service.js";

class AgentController {
  constructor() {
    this.agentService = new AgentService();
    this.searchAgents = this.searchAgents.bind(this);
    this.useAgentAPI = this.useAgentAPI.bind(this);
    this.createAgent = this.createAgent.bind(this);
    this.getAgent = this.getAgent.bind(this);
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
      const { agentID } = req.query;
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
    const apiKey = req.headers["sei-agents-access-key"];

    if (!agentID) {
      return res
        .status(400)
        .send({ success: false, message: "agentID is required" });
    }

    if (!apiKey) {
      return res
        .status(401)
        .send({ success: false, message: "Access key missing" });
    }

    try {
      const originalAPI = await this.agentService.useAgent(apiKey, agentID);
      return res.status(200).redirect(originalAPI);
    } catch (err) {
      res.status(err.statusCode).send({
        success: false,
        message: err.message,
      });
    }
  }
}

export default AgentController;
