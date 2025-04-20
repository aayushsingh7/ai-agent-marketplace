import { Router } from "express";
import AgentController from "../controllers/agent.controller.js";
const agentRoutes = Router();
const agentController = new AgentController();

agentRoutes.get("/", agentController.getAgent);
agentRoutes.get("/search", agentController.searchAgents);
agentRoutes.post("/create", agentController.createAgent);
agentRoutes.get("/use", agentController.useAgentAPI); 

export default agentRoutes;
