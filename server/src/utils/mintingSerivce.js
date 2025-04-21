import { ethers } from "ethers";
import dotenv from "dotenv"
dotenv.config();

// Load environment variables
const privateKey = process.env.MINTER_PRIVATE_KEY;
const rpcUrl = process.env.RPC_URL;

// console.log(privateKey)

if (!privateKey || !rpcUrl) {
  throw new Error("Missing private key or RPC URL");
}

// Create a provider and wallet
const provider = new ethers.JsonRpcProvider(rpcUrl);
const minterWallet = new ethers.Wallet(privateKey, provider);

// Export wallet so you can use it in your NFT minting logic
export default minterWallet;
