// import crypto from "crypto";
// import jwt from "jsonwebtoken";
// import User from "../database/models/user.model.js";
// // import { Secp256k1, sha256 } from "@cosmjs/crypto";
// // import { fromBase64, toUtf8 } from "@cosmjs/encoding";
// // import bech32 from "bech32";
// import CustomError from "../utils/customError.js";
// import { StargateClient } from "@cosmjs/stargate";

// // function getSenderReceiver(data) {
// //   const transferEvent = data.events.find((event) => event.type === "transfer");
// //   if (!transferEvent) return { sender: null, receiver: null };

// //   let sender = null;
// //   let receiver = null;

// //   for (const attr of transferEvent.attributes) {
// //     if (attr.key === "sender") sender = attr.value;
// //     if (attr.key === "recipient") receiver = attr.value;
// //   }

// //   return { sender, receiver };
// // }

// async function verifyCosmosSignature(
//   address,
//   nonce,
//   signatureBase64,
//   pubkeyBase64
// ) {
//   const messageBytes = toUtf8(nonce);
//   const hashed = sha256(messageBytes);
//   const signature = fromBase64(signatureBase64);
//   const pubkey = fromBase64(pubkeyBase64);

//   const isValid = await Secp256k1.verifySignature(signature, hashed, pubkey);
//   if (!isValid) return false;

//   // Verify derived address matches the claimed address
//   const rawAddress = sha256(pubkey).slice(0, 20); // Cosmos address = first 20 bytes of SHA256(pubkey)
//   const derivedAddress = bech32.encode("sei", bech32.toWords(rawAddress));

//   return derivedAddress === address;
// }

// class AuthService {
//   constructor() {
//     this.user = User;
//     this.jwtSecret = process.env.JWT_SECRET || "your-jwt-secret-key";
//     this.jwtExpires = process.env.JWT_EXPIRES || "24h";
//   }

//   async generateNonce(query) {
//     try {
//       const { walletAddress } = query;

//       if (!walletAddress) {
//         throw new CustomError("Wallet address is required", 400);
//       }

//       const nonce = crypto.randomBytes(16).toString("hex");

//       let user = await User.findOne({ walletAddress });
//       if (!user) {
//         user = new User({ walletAddress, nonce });
//       } else {
//         user.nonce = nonce;
//       }

//       await user.save();
//       return { nonce };
//     } catch (error) {
//       if (error instanceof CustomError) {
//         throw error;
//       }
//       console.error("Error generating nonce:", error);
//       throw new CustomError("Failed to generate nonce", 500);
//     }
//   }

//   async verifySignature(data) {
//     try {
//       const { walletAddress, signature, pubkey } = data;

//       if (!walletAddress || !signature || !pubkey) {
//         throw new CustomError("Missing required parameters", 400);
//       }

//       const user = await User.findOne({ walletAddress });
//       if (!user) {
//         throw new CustomError("User not found", 404);
//       }

//       const nonce = user.nonce;
//       if (!nonce) {
//         throw new CustomError(
//           "No nonce found for this wallet. Please request a new one.",
//           400
//         );
//       }

//       const isValid = await verifyCosmosSignature(
//         walletAddress,
//         nonce,
//         signature,
//         pubkey
//       );

//       if (!isValid) {
//         throw new CustomError("Invalid signature", 401);
//       }

//       // Clear the nonce after successful verification to prevent replay attacks
//       user.nonce = null;
//       await user.save();

//       // Generate JWT token
//       const token = jwt.sign(
//         {
//           walletAddress,
//           userId: user._id,
//         },
//         this.jwtSecret,
//         { expiresIn: this.jwtExpires }
//       );

//       return {
//         success: true,
//         message: "Authentication successful",
//         token,
//       };
//     } catch (error) {
//       if (error instanceof CustomError) {
//         throw error;
//       }
//       console.error("Error verifying signature:", error);
//       throw new CustomError("Failed to verify signature", 500);
//     }
//   }

//   validateToken(token) {
//     if (!token) {
//       throw new CustomError("No token provided", 401);
//     }

//     try {
//       // Remove Bearer prefix if present
//       if (token.startsWith("Bearer ")) {
//         token = token.slice(7);
//       }

//       const decoded = jwt.verify(token, this.jwtSecret);
//       return decoded;
//     } catch (error) {
//       throw new CustomError("Invalid or expired token", 401);
//     }
//   }

//   // async validTransaction(txHash) {
//   //   try {
//   //     const rpcEndpoint = "https://rpc.atlantic-2.seinetwork.io"; // Example testnet RPC
//   //     const client = await StargateClient.connect(rpcEndpoint);
//   //     const tx = await client.getTx(txHash);
//   //     if (!tx) {
//   //       console.log("Transaction not found");
//   //       return;
//   //     }

//   //     const data = getSenderReceiver(tx);
//   //     return data;
//   //   } catch (err) {
//   //     console.log(err);
//   //     throw new CustomError(
//   //       "Something went wrong while validating the transaction",
//   //       500
//   //     );
//   //   }
//   // }
// }

// export default AuthService;

import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../database/models/user.model.js";
import CustomError from "../utils/customError.js";
import { ethers } from "ethers";

async function verifyEthereumSignature(address, message, signature) {
  try {
    // Ethereum signed messages are prefixed with this standard string
    // and hashed before signing
    const signerAddress = ethers.utils.verifyMessage(message, signature);

    // Convert addresses to checksummed format for case-insensitive comparison
    const normalizedInputAddress = ethers.utils.getAddress(address);
    const normalizedRecoveredAddress = ethers.utils.getAddress(signerAddress);

    return normalizedInputAddress === normalizedRecoveredAddress;
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

class AuthService {
  constructor() {
    this.user = User;
    this.jwtSecret = process.env.JWT_SECRET || "450294r0jf4904ut90.4250348@*#*@fqefa.dfadte9GJ498937589u8UW8JR7.50829048590284HIEH38943809VNIOVEWRH0ekfhn948ut80*@)($*90ggjg";
    this.jwtExpires = process.env.JWT_EXPIRES || "24h";
  }

  async generateNonce(query) {
    try {
      const { walletAddress } = query;

      if (!walletAddress) {
        throw new CustomError("Wallet address is required", 400);
      }

      const nonce = crypto.randomBytes(16).toString("hex");

      // Standard message format for Ethereum wallets
      const message = `Sign this message to verify your identity. Nonce: ${nonce}`;

      let user = await User.findOne({ walletAddress });
      if (!user) {
        user = new User({ walletAddress, nonce });
      } else {
        user.nonce = nonce;
      }

      await user.save();
      return { nonce, message };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.error("Error generating nonce:", error);
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

      // Clear the nonce after successful verification to prevent replay attacks
      user.nonce = null;
      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        {
          walletAddress,
          userId: user._id,
        },
        this.jwtSecret,
        { expiresIn: this.jwtExpires }
      );

      return {
        success: true,
        message: "Authentication successful",
        token,
      };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.error("Error verifying signature:", error);
      throw new CustomError("Failed to verify signature", 500);
    }
  }
}

export default AuthService;
