import AuthService from "../services/auth.service.js";

class AuthController {
  constructor() {
    this.authService = new AuthService();
    this.generateNonce = this.generateNonce.bind(this);
    this.verifySignature = this.verifySignature.bind(this);
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
      res.status(err.statusCode || 500).send({ success: false, message: err.message });
    }
  }

  async verifySignature(req, res) {
    console.log("-------------------------------- ", req, " ----------------------------------------")
    try {
      const result = await this.authService.verifySignature(req.query);
      res
        .status(200)
        .send({ success: true, message: "Verified Signature", token: result.token });
    } catch (err) {
      console.log(err)
      res.status(err.statusCode || 500).send({ success: false, message: err.message });
    }
  }
}

export default AuthController;
