import { Schema, model } from "mongoose";

const agentSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true }, //00
    category: { type: String, required: true },
    mintOnBlockchain: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    isNFT: { type: Boolean, default: false },
    ratings: { type: Number, default: 0 },
    totalRatedCount: { type: Number, deault: 0 },
    planType: { type: String, enum: ["Paid", "Free"] },
    responseTime: { type: String, default: 500 },
    owner: { type: Schema.Types.ObjectId, ref: "user" },
    purpose: { type: String, required: true },
    trainedOn: { type: String, required: true }, //00
    tags: [{ type: String }],
    status: { type: Number, enum: [0, 1] },
    usageLicense: { type: String },
    isForSale:{type:Boolean,default:false},
    salePrice:{type:Number,default:0},
    blockchainDetails: [
      { blockchain: { type: String, enum: ["Sei Network"] } },
      { transactionHash: { type: String } },
    ],
    documentation: { type: String, required: true },
    deployedAPI: { type: String, required: true },
    rentingDetails: [
      { costPerCredit: { type: Number, default: 0 } },
      { creditCostPerReq: { type: Number, default: 0 } },
    ],
    ownershipHistory: [
      {
        type: { type: String, enum: ["Transfered", "Purchased", "Minted"] },
        timestamp: { type: Date, default: Date.now },
        gasFree: { type: Number },
        transactionHash: { type: String },
      },
    ],
  },
  { timestamps: true }
);

const Agent = model("Agent", agentSchema);

export default Agent;
