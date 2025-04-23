import mongoose from "mongoose";
import Agent from "../database/models/agent.model.js";
import User from "../database/models/user.model.js";
import UserCredit from "../database/models/userCredit.model.js";
import CustomError from "../utils/customError.js";
import jwt, { decode } from "jsonwebtoken";

class AgentService {
  constructor() {
    this.agent = Agent;
    this.credit = UserCredit;
    this.user = User;
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
      const agents = await this.agent
        .find({
          $or: [
            { name: { $regex: query, $options: "i" } },
            { category: { $regex: query, $options: "i" } },
            {
              tags: {
                $elemMatch: { $regex: query, $options: "i" },
              },
            },
          ],
        })
        .populate({
          path: "creator",
          select: "username walletAddress",
        });
      return agents;
    } catch (err) {
      throw new CustomError("Fsailed to search agents: " + err.message);
    }
  }

  async getAgent(agentID) {
    try {
      if (!mongoose.Types.ObjectId.isValid(agentID)) {
        throw new CustomError("Invalid Agent ID format", 400);
      }

      const agent = await this.agent.findOne({ _id: agentID }).populate([
        {
          path: "owner",
          select: "username walletAddress",
        },
        {
          path: "creator",
          select: "username walletAddress",
        },
      ]);

      if (!agent) {
        throw new CustomError("Agent not found", 404);
      }

      return agent;
    } catch (err) {
      throw new CustomError("Failed to retrieve agent: " + err.message, 500);
    }
  }

  async useAgent(creditID, agentID, requestType, userID) {
    try {
      if (requestType == "trail-use") {
        const user = await this.user.findOne({ _id: userID });
        if (!user) throw new CustomError("User not found", 404);

        let freeTrailIndex = user.freeRequestsPerAgent.findIndex(
          (agentDetail) => agentDetail.agentID == agentID
        );

        // If the agent is not in the array, add it
        if (freeTrailIndex === -1) {
          user.freeRequestsPerAgent.push({
            agentID,
            request: 1,
          });
        } else {
          // Check limit before incrementing
          if (user.freeRequestsPerAgent[freeTrailIndex].request > 3)
            throw new CustomError(
              "Free usage limit exceeded, please buy credits"
            );

          user.freeRequestsPerAgent[freeTrailIndex].request += 1;
        }

        await user.save();
        const agent = await this.agent.findOne({ _id: agentID });
        if (!agent) throw new CustomError("Agent not found", 404);
        return agent.deployedAPI;
      } else if (requestType == "owner-privilage") {
        let agent = await this.agent.findOne({ _id: agentID });
        if (!agent) throw new CustomError("Agent not found", 404);
        if (agent.owner != userID)
          throw new CustomError("Owner Privilage is only for NFT Owner");
        return agent.deployedAPI;
      } else {
        const userCredit = await this.credit.findOne({ _id: creditID });
        if (!userCredit) throw new CustomError("User credit not found", 404);

        if (userCredit.creditsCostPerRequest > userCredit.totalCredits) {
          throw new CustomError(
            "No credits remaining, please buy more credits",
            401
          );
        }

        userCredit.totalCredits -= userCredit.creditsCostPerRequest;
        userCredit.creditsUsed += userCredit.creditsCostPerRequest;
        await userCredit.save();

        const agent = await this.agent.findOne({ _id: agentID });
        if (!agent) throw new CustomError("Agent not found", 404);
        return agent.deployedAPI;
      }
    } catch (err) {
      if (err instanceof CustomError) throw err;
      console.error("useAgent error:", err);
      throw new CustomError("Internal Server Error", 500);
    }
  }

  async fetchOwnedNFTs(userID) {
    try {
      let nfts = await this.agent.find({ owner: userID });
      return nfts;
    } catch (err) {
      throw new CustomError("Oops! something went wrong", 500);
    }
  }
}

export default AgentService;
