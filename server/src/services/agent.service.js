import Agent from "../database/models/agent.model.js";
import User from "../database/models/user.model.js";
import UserCredit from "../database/models/userCredit.model.js";
import CustomError from "../utils/customError.js";
import jwt, { decode } from "jsonwebtoken";

class AgentService {
  constructor() {
    this.agent = Agent;
    this.credit = UserCredit;
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
          { category: { $regex: query, $options: "i" } },
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
        throw new CustomError("Agent not found", 404);
      }

      return agent;
    } catch (err) {
      throw new CustomError("Failed to retrieve agent: " + err.message);
    }
  }

  async useAgent(API_ACCESS_KEY, agentID) {
    try {
      const decoded = jwt.verify(API_ACCESS_KEY, process.env.SECRET_KEY);
      const { userID } = decoded;

      const userCredit = await this.credit.findOne({ user: userID });
      if (!userCredit) throw new CustomError("User credit not found", 404);

      if (userCredit.creditsCostPerRequest > userCredit.totalCredits) {
        throw new CustomError(
          "No credits remaining, please buy more credits",
          401
        );
      }

      userCredit.totalCredits -= userCredit.creditsCostPerRequest;
      await userCredit.save();

      const agent = await this.agent.findOne({ _id: agentID });
      if (!agent) throw new CustomError("Agent not found", 404);

      return agent.deployedAPI;
    } catch (err) {
      if (err instanceof CustomError) throw err;
      console.error("useAgent error:", err);
      throw new CustomError("Internal Server Error", 500);
    }
  }
}

export default AgentService;
