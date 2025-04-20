import { Schema, model } from "mongoose";

const userCreditsSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "user" },
    agent: { type: Schema.Types.ObjectId, ref: "agent" },
    totalCredits: { type: Number, required: true },
    creditsUsed: { type: Number, required: true },
    creditsCostPerRequest: { type: Number, required: true, default: 1 },
    accessToken: { type: String, default: null },
    walletAddress:{type:String,required:true},
    history: [
      {
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
