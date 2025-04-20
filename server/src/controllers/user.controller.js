import UserService from "../services/user.service.js";

class UserController {
  constructor() {
    this.userService = new UserService();
    this.getUserData = this.getUserData.bind(this);
    this.updateUserInfo = this.updateUserInfo.bind(this);
    this.fetchSubscriptions = this.fetchSubscriptions.bind(this);
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
    const { userID } = req.params;
    try {
      const results = await this.userService.fetchSubscriptions(userID);
      res
        .status(200)
        .send({
          success: true,
          message: "Subscriptions fetched successfully",
          data: results,
        });
    } catch (err) {
      res.status(err.statusCode).send({ success: false, message: err.message });
    }
  }
}

export default UserController;
