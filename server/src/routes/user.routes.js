import { Router } from "express";
import UserController from "../controllers/user.controller.js";
const userRoutes = Router();
const userController = new UserController()

userRoutes.get("/:userID",userController.getUserData);
userRoutes.put("/:userID/edit", userController.updateUserInfo)
userRoutes.get("/:userID/subscriptions", userController.fetchSubscriptions)

export default userRoutes;