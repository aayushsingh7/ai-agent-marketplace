import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    walletAddress:{type:String,required:true}, 
    nonce:{type:String,required:true},
  },
  { timestamps: true }
);

const User = model("User", userSchema);

export default User;
