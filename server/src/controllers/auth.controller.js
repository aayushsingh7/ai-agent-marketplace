import AuthService from "../services/auth.service.js";

class AuthController {
    constructor() {
        this.authService = new AuthService();
        this.validTransaction = this.validTransaction.bind(this);
    }

    async validTransaction (req,res){
     const {txHash} = req.query;
     try {
        let data = await this.authService.validTransaction(txHash)
        res.status(200).send({success:true,data})
     } catch (err) {
        console.log(err)
        res.status(err.statusCode).send({success:false,message:err.message})
     }
    }
}

export default AuthController;