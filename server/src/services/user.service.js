import mongoose from "mongoose";
import CustomError from "../utils/customError";
import User from "../database/models/user.model";

class UserService {
    constructor(){
        this.user = User;
    }

    async getUser(userID) {
        if(!mongoose.Types.ObjectId.isValid(userID)) throw new CustomError("Invalid User ID format", 400)
        try {
          const user = await this.user.findOne({_id:userID}).select("-password")
          if(!user) throw new CustomError("No User Found, please verfiy the userID", 404)
          return user
        } catch (err) {
            console.log(err)
            throw new CustomError("Oops Something went wrong!", 500)
        }
    }

    async updateUserInfo(data) {
        const {userID, newDetails} = data;
        if(!mongoose.Types.ObjectId.isValid(userID)) throw new CustomError("Invalid User ID format", 400)
            try {
              const updateStatus = await this.user.updateOne({_id:userID},{$set:newDetails})
              if(!updateStatus.acknowledged) throw new CustomError("Cannot Update User Info, Try Again Later", 400)
              return updateStatus
            } catch (err) {
                console.log(err)
                throw new CustomError("Oops Something went wrong!", 500)
            }
    }

    
}


export default UserService;