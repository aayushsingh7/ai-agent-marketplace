import { Schema, model } from "mongoose";

const agentSchema = new Schema(
  {
    tokenId: { type: String },
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    mintOnBlockchain: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    isNFT: { type: Boolean, default: true },
    ratings: { type: Number, default: 0 },
    totalRatedCount: { type: Number, default: 0 }, // Fixed typo: deault -> default
    planType: { type: String, enum: ["Paid", "Free"] },
    responseTime: { type: String, default: "500" },
    owner: { type: Schema.Types.ObjectId, ref: "User" },
    creator:{ type: Schema.Types.ObjectId, ref: "User" }, // Changed to String to store wallet address
    purpose: { type: String, required: true },
    trainedOn: [{ type: String }],
    tags: [{ type: String }],
    status: { type: Number, enum: [0, 1] },
    usageLicense: { type: String },
    isForSale: { type: Boolean, default: false },
    salePrice: { type: Number, default: 0 },
    blockchainDetails: {
      blockchain: { type: String, default: "Sei Network" },
    },
    documentation: { type: String, required: true },
    deployedAPI: { type: String, required: true },
    rentingDetails: {
      costPerCredit: { type: Number, default: 0 },
      creditCostPerReq: { type: Number, default: 0 }
    },
    ownershipHistory: [
      {
        owner: { type: String },
        type: { type: String, enum: ["Transfered", "Purchased", "Minted"] },
        timestamp: { type: Date, default: Date.now },
        gasFee: { type: Number },
        transactionHash: { type: String }
      }
    ]
  },
  { timestamps: true }
);

const Agent = model("Agent", agentSchema);

export default Agent;