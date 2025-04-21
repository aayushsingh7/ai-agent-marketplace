import { Router } from "express";
import UserController from "../controllers/user.controller.js";
import authenticateUser from "../milddleware/authenticateUser.js";
const userRoutes = Router();
const userController = new UserController()

userRoutes.get("/:userID",authenticateUser,userController.getUserData);
userRoutes.put("/:userID/edit",authenticateUser ,userController.updateUserInfo)
userRoutes.get("/:userID/subscriptions",authenticateUser, userController.fetchSubscriptions)
userRoutes.get("/:userID/agents/:agentID/user-credit", authenticateUser,userController.getUserCredit)

export default userRoutes;