import Agent from "../database/models/agent.model";
import CustomError from "../utils/customError.js";

class AgentService {
  constructor() {
    this.agent = Agent;
  }

  async createAgent(agentData) {
    try {
      const newAgent = new this.agent(agentData);
      await newAgent.save();
      return newAgent;
    } catch (err) {
      throw new CustomError("Failed to create agent" + err.message);
    }
  }

  async searchAgent(query) {
    try {
      const agents = await this.agent.find({
        $or: [
          { name: { $regex: query, $options: "i" } },
          {
            tags: {
              $elemMatch: { $regex: query, $options: "i" },
            },
          },
        ],
      });
      return agents;
    } catch (err) {
      throw new CustomError("Failed to search agents: " + err.message);
    }
  }

  async getAgent(agentID) {
    try {
      if (!mongoose.Types.ObjectId.isValid(agentID)) {
        throw new CustomError("Invalid Agent ID format", 400);
      }
  
      const agent = await this.agent.findOne({ _id: agentID });
  
      if (!agent) {
        throw new CustomError("Agent not found",404);
      }
  
      return agent;
    } catch (err) {
      throw new CustomError("Failed to retrieve agent: " + err.message);
    }
  }
  
}

export default AgentService;
