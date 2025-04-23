import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../database/models/user.model.js";
import CustomError from "../utils/customError.js";
import { ethers } from "ethers";

async function verifyEthereumSignature(address, message, signature) {
  try {
    const signerAddress = ethers.verifyMessage(message, signature);
    const normalizedInputAddress = ethers.getAddress(address);
    const normalizedRecoveredAddress = ethers.getAddress(signerAddress);

    return normalizedInputAddress === normalizedRecoveredAddress;
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

function generateUsername() {
  const chars = "abcdefghijklmnopqrstuvwxyz123456789";
  let username = "";

  for (let i = 0; i < 10; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    username += chars[randomIndex];
  }

  return username;
}

class AuthService {
  constructor() {
    this.user = User;
    this.jwtSecret =
      process.env.JWT_SECRET ||
      "45409feeefqw.OPIPOI909343Mafdaerdf.eri393529fiadfasdf5pdfakdfeopk";
    this.jwtExpires = process.env.JWT_EXPIRES || "24h";
  }

  async generateNonce(query) {
    try {
      const { walletAddress } = query;

      if (!walletAddress) {
        throw new CustomError("Wallet address is required", 400);
      }

      const nonce = crypto.randomBytes(16).toString("hex");
      const message = `Sign this message to verify your identity. Nonce: ${nonce}`;

      let user = await User.findOne({ walletAddress });
      if (!user) {
        user = new User({
          walletAddress,
          nonce,
          freeRequestsPerAgent: [],
          username: generateUsername(),
        });
      } else {
        user.nonce = nonce;
      }

      await user.save();
      return { nonce, message };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("Failed to generate nonce", 500);
    }
  }

  async verifySignature(data) {
    try {
      const { walletAddress, signature } = data;
      if (!walletAddress || !signature) {
        throw new CustomError("Missing required parameters", 400);
      }

      const user = await User.findOne({ walletAddress });
      if (!user) {
        throw new CustomError("User not found", 404);
      }

      const nonce = user.nonce;

      if (!nonce) {
        throw new CustomError(
          "No nonce found for this wallet. Please request a new one.",
          400
        );
      }

      // Reconstruct the message that was signed
      const message = `Sign this message to verify your identity. Nonce: ${nonce}`;

      const isValid = await verifyEthereumSignature(
        walletAddress,
        message,
        signature
      );

      if (!isValid) {
        throw new CustomError("Invalid signature", 401);
      }

      user.nonce = null;
      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        {
          walletAddress,
          userID: user._id,
        },
        this.jwtSecret
      );

      return {
        success: true,
        message: "Authentication successful",
        token,
        data: user,
      };
    } catch (error) {
      console.log(error);
      throw new CustomError("Failed to verify signature", 500);
    }
  }
}

export default AuthService;
