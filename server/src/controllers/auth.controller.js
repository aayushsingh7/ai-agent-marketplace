import User from "../database/models/user.model.js";
import AuthService from "../services/auth.service.js";

class AuthController {
  constructor() {
    this.user = User;
    this.authService = new AuthService();
    this.generateNonce = this.generateNonce.bind(this);
    this.verifySignature = this.verifySignature.bind(this);
    this.getLoggedInUser = this.getLoggedInUser.bind(this);
  }

  async generateNonce(req, res) {
    try {
      const nonce = await this.authService.generateNonce(req.query);
      res.status(200).send({
        success: true,
        message: "Nonce generated successfully",
        data: nonce,
      });
    } catch (err) {
      res
        .status(err.statusCode || 500)
        .send({ success: false, message: err.message });
    }
  }

  async verifySignature(req, res) {
    try {
      const result = await this.authService.verifySignature(req.query);
      res
        .cookie("seiagents", result.token, {
          httpOnly: true,
          secure:process.env.NODE_ENV === 'production',
          path: "/",
        })
        .status(200)
        .send({
          success: true,
          message: "Verified Signature",
          token: result.token,
        });
    } catch (err) {
      res
        .status(err.statusCode || 500)
        .send({ success: false, message: err.message });
    }
  }

  async getLoggedInUser(req, res) {

    try {
      const userData = await this.user.findOne({ _id: req.userID });
      res
        .status(200)
        .send({
          success: true,
          message: "User data fetched successfully",
          data: userData,
        });
    } catch (err) {
      console.log(err)
      res
        .status(500)
        .send({ success: false, message: "Oops! something went wrong" });
    }
  }
}

export default AuthController;
