import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String },
    username: { type: String, unique: true },
    walletAddress:{type:String,required:true}, 
    nonce:{type:String},
  },
  { timestamps: true }
);

const User = model("User", userSchema);

export default User;
