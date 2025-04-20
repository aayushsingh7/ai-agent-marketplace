import { Router } from "express";
import UserController from "../controllers/user.controller.js";
const userRoutes = Router();
const userController = new UserController()

userRoutes.get("/user",userController.getUserData);
userRoutes.put("/user/edit", userController.updateUserInfo)
userRoutes.get("/user/subscriptions", userController.fetchSubscriptions)

export default userRoutes;