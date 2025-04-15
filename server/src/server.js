// server.js
import express from "express";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { SigningStargateClient, GasPrice } from "@cosmjs/stargate";
import cors from "cors";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// SEI testnet configuration
const SEI_RPC_URL = "https://sei-testnet-rpc.polkachu.com";
const SEI_DENOM = "usei"; // microSEI - 1 SEI = 1,000,000 usei

// In-memory storage for nonces (in production, use a database)
const nonceStore = new Map();

// ====== Authentication Routes ======

// Generate a nonce for wallet signature authentication
app.get("/auth/nonce", (req, res) => {
  const { address } = req.query;

  if (!address) {
    return res.status(400).json({ error: "Address is required" });
  }

  // Generate a random nonce
  const nonce = crypto.randomBytes(32).toString("hex");

  // Store the nonce with a timestamp (for expiration)
  nonceStore.set(address, {
    nonce,
    timestamp: Date.now(),
  });

  return res.json({ nonce });
});

// Verify a signed nonce
app.post("/auth/verify", async (req, res) => {
  const { address, nonce, signature } = req.body;

  // Check if all required fields are present
  if (!address || !nonce || !signature) {
    return res.status(400).json({
      success: false,
      message: "Address, nonce, and signature are required",
    });
  }

  // Check if the nonce exists and hasn't expired
  const storedNonceData = nonceStore.get(address);
  if (!storedNonceData || storedNonceData.nonce !== nonce) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired nonce",
    });
  }

  // Check if the nonce is expired (15 minutes)
  if (Date.now() - storedNonceData.timestamp > 15 * 60 * 1000) {
    nonceStore.delete(address);
    return res.status(401).json({
      success: false,
      message: "Nonce expired",
    });
  }

  try {
    // Verify the signature (this would ideally use CosmJS verification)
    // For a complete implementation, you would verify that the signature
    // was actually signed by the address

    // Delete the nonce so it can't be reused
    nonceStore.delete(address);

    // Generate a simple session token (in production, use JWT)
    const sessionToken = crypto.randomBytes(32).toString("hex");

    return res.json({
      success: true,
      message: "Authentication successful",
      token: sessionToken,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Signature verification failed",
    });
  }
});

// ====== Wallet Routes ======

// Get wallet balance
app.get("/wallet/balance/:address", async (req, res) => {
  try {
    const { address } = req.params;

    // Create a client without signing capability (read-only)
    const client = await SigningStargateClient.connect(SEI_RPC_URL);

    // Get balance
    const balance = await client.getBalance(address, SEI_DENOM);

    return res.json({
      success: true,
      address,
      balance: {
        denom: balance.denom,
        amount: balance.amount,
        amountInSei: (parseInt(balance.amount) / 1000000).toString(),
      },
    });
  } catch (error) {
    console.error("Balance error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get balance",
    });
  }
});

// ====== Transfer Routes ======

// Transfer tokens from admin wallet to another address
app.post("/transfer/admin", async (req, res) => {
  try {
    const { recipientAddress, amount } = req.body;

    // Validate input
    if (!recipientAddress || !amount) {
      return res.status(400).json({
        success: false,
        message: "Recipient address and amount are required",
      });
    }

    // Make sure mnemonic is set in environment variables
    if (!process.env.ADMIN_WALLET_MNEMONIC) {
      return res.status(500).json({
        success: false,
        message: "Admin wallet mnemonic not configured",
      });
    }

    // Convert amount to microsei (usei)
    const amountInUsei = Math.floor(parseFloat(amount) * 1000000).toString();

    // Create wallet from mnemonic
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(
      process.env.ADMIN_WALLET_MNEMONIC,
      { prefix: "sei" }
    );

    const [account] = await wallet.getAccounts();
    const client = await SigningStargateClient.connectWithSigner(
      SEI_RPC_URL,
      wallet,
      { gasPrice: GasPrice.fromString("0.1usei") }
    );

    // Check admin wallet balance
    const balance = await client.getBalance(account.address, SEI_DENOM);
    if (parseInt(balance.amount) < parseInt(amountInUsei)) {
      return res.status(400).json({
        success: false,
        message: "Insufficient funds in admin wallet",
        balance: balance.amount,
      });
    }

    // Send tokens
    const result = await client.sendTokens(
      account.address,
      recipientAddress,
      [{ denom: SEI_DENOM, amount: amountInUsei }],
      {
        amount: [{ denom: SEI_DENOM, amount: "5000" }],
        gas: "200000",
      }
    );

    return res.json({
      success: true,
      transactionHash: result.transactionHash,
      senderAddress: account.address,
      recipientAddress,
      amount: amount,
      amountInUsei,
    });
  } catch (error) {
    console.error("Transfer error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to transfer tokens",
    });
  }
});

// User-initiated transfer using Compass wallet signature
app.post("/transfer/user", async (req, res) => {
  try {
    const { senderAddress, recipientAddress, amount, signature } = req.body;

    // Validate input
    if (!senderAddress || !recipientAddress || !amount || !signature) {
      return res.status(400).json({
        success: false,
        message:
          "Sender address, recipient address, amount, and signature are required",
      });
    }

    // In a real implementation, you would verify the signature here
    // This is a simplified version for the hackathon

    // Convert amount to microsei (usei)
    const amountInUsei = Math.floor(parseFloat(amount) * 1000000).toString();

    // For a hackathon demo, we'll use the admin wallet to execute the transfer
    // In a real application, you would use the user's wallet credentials
    // This is a simplification for the hackathon
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(
      process.env.ADMIN_WALLET_MNEMONIC,
      { prefix: "sei" }
    );

    const [account] = await wallet.getAccounts();
    const client = await SigningStargateClient.connectWithSigner(
      SEI_RPC_URL,
      wallet,
      { gasPrice: GasPrice.fromString("0.1usei") }
    );

    // Send tokens
    const result = await client.sendTokens(
      account.address, // In a real app, this would be senderAddress
      recipientAddress,
      [{ denom: SEI_DENOM, amount: amountInUsei }],
      {
        amount: [{ denom: SEI_DENOM, amount: "5000" }],
        gas: "200000",
      }
    );

    return res.json({
      success: true,
      transactionHash: result.transactionHash,
      senderAddress: account.address,
      recipientAddress,
      amount: amount,
      amountInUsei,
    });
  } catch (error) {
    console.error("Transfer error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to transfer tokens",
    });
  }
});

// ====== Transaction History ======

// Get transaction history for an address
app.get("/transactions/:address", async (req, res) => {
  try {
    const { address } = req.params;

    // In a real implementation, you would query a blockchain explorer API
    // or index transactions yourself

    // This is a placeholder for demonstration purposes
    return res.json({
      success: true,
      message:
        "Transaction history functionality requires additional integration with blockchain explorers or indexers",
      transactions: [],
    });
  } catch (error) {
    console.error("Transaction history error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get transaction history",
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`SEI Wallet API running on port ${PORT}`);
  console.log(`RPC URL: ${SEI_RPC_URL}`);
});
