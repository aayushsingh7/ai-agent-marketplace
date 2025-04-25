import UserCredit from "../database/models/userCredit.model.js";
import UserService from "../services/user.service.js";

class UserController {
  constructor() {
    this.userService = new UserService();
    this.credit = UserCredit;
    this.getUserData = this.getUserData.bind(this);
    this.updateUserInfo = this.updateUserInfo.bind(this);
    this.fetchSubscriptions = this.fetchSubscriptions.bind(this);
    this.getUserCredit = this.getUserCredit.bind(this);
    this.logout = this.logout.bind(this);
  }

  async getUserData(req, res) {
    const { userID } = req.params;
    try {
      const user = await this.userService.getUser(userID);
      res.status(200).send({
        success: true,
        message: "User data fetched successfully",
        data: user,
      });
    } catch (err) {
      res.status(err.statusCode).send({ success: false, message: err.message });
    }
  }

  async updateUserInfo(req, res) {
    const data = req.body;
    try {
      const result = await this.updateUserInfo(data);
      res.status(200).send({
        success: true,
        message: "User data updated successfully",
        updateInfo: result,
      });
    } catch (err) {
      res.status(err.statusCode).send({ success: false, message: err.message });
    }
  }

  async fetchSubscriptions(req, res) {
    const { userID } = req;
    try {
      const results = await this.userService.fetchSubscriptions(userID);
      res.status(200).send({
        success: true,
        message: "Subscriptions fetched successfully",
        data: results,
      });
    } catch (err) {
      res.status(err.statusCode).send({ success: false, message: err.message });
    }
  }

  async getUserCredit(req, res) {
    try {
      const { userID, agentID } = req.params;
      const credit = await this.credit.findOne({
        user: userID,
        agent: agentID,
      });
      if (!credit)
        return res
          .status(404)
          .send({ success: false, message: "No user credit found" });
      res.status(200).send({
        success: true,
        message: "User credits fetched successfully",
        data: credit,
      });
    } catch (err) {
      res
        .status(500)
        .send({ success: false, message: "Oops! something went wrong" });
    }
  }

  async logout(req, res) {
    try {
      res.clearCookie("seiagents",{
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "None", 
        path: "/",
      });
      res
        .status(200)
        .send({ success: true, message: "User logout successfully" });
    } catch (err) {
      res.status(500).send({ success: false, message: err.message });
    }
  }
}

export default UserController;
