import { Schema, model } from "mongoose";

const userCreditsSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    agent: { type: Schema.Types.ObjectId, ref: "Agent" },
    totalCredits: { type: Number, required: true },
    creditsUsed: { type: Number, required: true },
    creditsCostPerRequest: { type: Number, required: true, default: 1 },
    accessToken: { type: String, default: null },
    walletAddress:{type:String,required:true},
    history: [
      {
        totalCreditPurchased:{type:Number,default:1},
        type: { type: String, enum: ["Purchased", "Used", "Bonus", "Refunded"] },
        amount: { type: Number, required: true },
        reason: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        gasFree: { type: Number, required: true },
        transactionHash: { type: String },
      },
    ],
  },
  { timestamps: true }
);

const UserCredit = model("UserCredit", userCreditsSchema);

export default UserCredit;
