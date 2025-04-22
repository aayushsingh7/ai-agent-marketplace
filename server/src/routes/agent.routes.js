import { Router } from "express";
import AgentController from "../controllers/agent.controller.js";
import validateAgentAccessToken from "../milddleware/validateAgentAccessToken.js";
import authenticateUser from "../milddleware/authenticateUser.js";
const agentRoutes = Router();
const agentController = new AgentController();

agentRoutes.get("/", agentController.getAgents)
agentRoutes.get("/agent/:agentID", agentController.getAgent);
agentRoutes.get("/search", agentController.searchAgents);
agentRoutes.post("/create",authenticateUser, agentController.createAgent);
agentRoutes.post("/use", validateAgentAccessToken,agentController.useAgentAPI); 
agentRoutes.get("/nfts", authenticateUser, agentController.fetchOwnedNFTs)

export default agentRoutes;
