import mongoose from "mongoose";
import CustomError from "../utils/customError.js";
import User from "../database/models/user.model.js";
import UserCredit from "../database/models/userCredit.model.js";

class UserService {
  constructor() {
    this.user = User;
    this.credits = UserCredit;
  }

  async getUser(userID) {
    if (!mongoose.Types.ObjectId.isValid(userID))
      throw new CustomError("Invalid User ID format", 400);
    try {
      const user = await this.user.findOne({ _id: userID }).select("-password");
      if (!user)
        throw new CustomError("No User Found, please verfiy the userID", 404);
      return user;
    } catch (err) {
      throw new CustomError("Oops Something went wrong!", 500);
    }
  }

  async updateUserInfo(data) {
    const { userID, newDetails } = data;
    if (!mongoose.Types.ObjectId.isValid(userID))
      throw new CustomError("Invalid User ID format", 400);
    try {
      const updateStatus = await this.user.updateOne(
        { _id: userID },
        { $set: newDetails }
      );
      if (!updateStatus.acknowledged)
        throw new CustomError("Cannot Update User Info, Try Again Later", 400);
      return updateStatus;
    } catch (err) {
      throw new CustomError("Oops Something went wrong!", 500);
    }
  }

  async fetchSubscriptions(userID) {
    try {
      const user = await this.user.findOne({ _id: userID });
      const results = await this.credits
        .find({ user: userID })
        .populate({
          path: "agent",
          select: "name description category verified walletAddress owner",
          // Include owner in the selection to use for filtering
        })
        .then((credits) => {
          // Filter out credits where the user is the owner of the agent
          return credits.filter(
            (credit) =>
              credit.agent &&
              credit.agent.owner &&
              !credit.agent.owner.equals(userID)
          );
        });

      return results;
    } catch (err) {
      throw new CustomError("Oops something went wrong", 500);
    }
  }
}

export default UserService;
