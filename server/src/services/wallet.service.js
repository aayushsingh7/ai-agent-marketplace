import { ethers } from "ethers";
import CustomError from "../utils/customError.js";
import UserCredit from "../database/models/userCredit.model.js";
import Agent from "../database/models/agent.model.js";
import AgentService from "../services/agent.service.js";
import User from "../database/models/user.model.js";
import jwt from "jsonwebtoken";

// ABI fragment for the AIAgentMarketplace contract
const ABI = [
  "function createAgent(address recipient, string memory tokenURI, uint256 creditCost, uint256 salePrice, bool forSale) public returns (uint256)",
  "function updateAgentInfo(uint256 tokenId, uint256 newCreditCost, uint256 newSalePrice, bool newForSale) public",
  "function getAgentCreditCost(uint256 tokenId) public view returns (uint256)",
  "function getAgentSalePrice(uint256 tokenId) public view returns (uint256)",
  "function isAgentForSale(uint256 tokenId) public view returns (bool)",
  "function buyCredit(uint256 tokenId, uint256 creditAmount) payable",
  "function buyAgent(uint256 tokenId) payable",
  "function useAgent(uint256 tokenId) public returns (bool)",
  "function getCreditBalance(address user) public view returns (uint256)",
];

class WalletService {
  constructor() {
    this.rpcUrl = "https://evm-rpc-testnet.sei-apis.com";
    this.contractAddress = "0x35b32b80FBe7526487d1b41c8860F684A7A48cc6";
    this.chainId = 1328;
    this.credit = UserCredit;
    this.agent = Agent;
    this.agentService = new AgentService();
    this.user = User;

    // Initialize provider
    this.provider = new ethers.JsonRpcProvider(this.rpcUrl, {
      chainId: this.chainId,
      name: "SEI Testnet",
    });
  }

  // Helper method to get contract instance with signer
  async getContract(wallet) {
    if (!wallet) {
      throw new CustomError("Wallet connection required", 400);
    }

    try {
      const signer = wallet.connect(this.provider);
      return new ethers.Contract(this.contractAddress, ABI, signer);
    } catch (err) {
      console.error("Failed to get contract instance:", err);
      throw new CustomError("Failed to connect wallet to provider", 500);
    }
  }

  
  async createAgent(wallet, recipient, agentData, gasLimit) {
    try {
      if (!recipient) {
        throw new CustomError("Recipient address is required", 400);
      }

      // Extract required parameters from agentData
      const costPerCredit = ethers.parseEther(
        `${agentData.rentingDetails?.costPerCredit}`
      );
      const salePrice = agentData.salePrice || 0;
      const isForSale = agentData.isForSale || false;

      // Generate metadata JSON
      const metadataJSON = {
        name: agentData.name || "AI Agent",
        description: agentData.description || "AI Agent on SEI Blockchain",
        attributes: [
          { trait_type: "Trained On", value: agentData.trainedOn.join(", ") },
          { trait_type: "Category", value: agentData.category },
          { trait_type: "Tags", value: agentData.tags.join(", ") },
        ],
      };

      // Convert the metadata to a data URI (base64 encoded)
      const metadataString = JSON.stringify(metadataJSON);
      const tokenURI = `data:application/json;base64,${Buffer.from(
        metadataString
      ).toString("base64")}`;

      // Get contract instance
      const contract = await this.getContract(wallet);

      // Create transaction options
      const txOptions = {};
      if (gasLimit) {
        txOptions.gasLimit = gasLimit;
      }

      // Send transaction to create agent
      const tx = await contract.createAgent(
        recipient,
        tokenURI,
        costPerCredit,
        salePrice,
        isForSale,
        txOptions
      );


      // Wait for transaction to be mined
      const receipt = await tx.wait();
      let tokenId;

      // Try to find the AgentCreated event directly
      const agentCreatedEvent = receipt.events?.find(
        (event) => event.event === "AgentCreated"
      );

      if (agentCreatedEvent && agentCreatedEvent.args) {
        // Extract the token ID from the event arguments
        tokenId = agentCreatedEvent.args[0].toString();
      } else {

        // Fall back to manual log parsing
        for (const log of receipt.logs) {
          try {
            const parsedLog = contract.interface.parseLog(log);
            if (parsedLog && parsedLog.name === "AgentCreated") {
              tokenId = parsedLog.args[0].toString();
              break;
            }
          } catch (e) {
            // Skip logs that can't be parsed with this interface
            continue;
          }
        }
      }

      if (!tokenId) {
        console.warn("Could not find tokenId in transaction logs");
      }

      // Save agent data to MongoDB
      try {
        const creatorAddress = await wallet.getAddress();

        // Create ownership history record
        const ownershipRecord = {
          owner: recipient.toLowerCase(),
          type: "Minted",
          timestamp: new Date().toISOString(),
          gasFree: gasLimit || 0,
          transactionHash: receipt.hash,
        };

        // Prepare blockchain details
        const blockchainDetails = [
          { blockchain: "Sei Network" },
          { transactionHash: receipt.hash },
        ];

        // Format rentingDetails according to schema
        
        const rentingDetails = {
          costPerCredit: agentData.rentingDetails?.costPerCredit,
          creditCostPerReq: agentData.rentingDetails?.creditCostPerReq || 1,
        };

        const creator = await this.user.findOne({
          walletAddress: recipient,
        });

        // Create the agent document
        const newAgent = await this.agentService.createAgent({
          ...agentData,
          tokenId: tokenId,
          creator: creator._id,
          owner: creator._id,
          ownershipHistory: [ownershipRecord],
          blockchainDetails: blockchainDetails,
          salePrice,
          isForSale,
          isNFT: true,
          mintOnBlockchain: true,
          rentingDetails,
        });

        await newAgent.save();
      } catch (dbErr) {
        console.error("Failed to save agent to database:", dbErr);
        // We don't throw here as the blockchain transaction was successful
      }

      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        tokenId: tokenId?.toString() || "unknown",
        success: true,
        receipt: receipt,
      };
    } catch (err) {
      console.error("Create agent error:", err);
      throw new CustomError(err.message || "Failed to create agent", 500);
    }
  }

  
  async prepareBuyCredits(agentID, tokenId, creditAmount, userAddress) {
    try {
      if (
        !tokenId ||
        !creditAmount ||
        creditAmount <= 0 ||
        !agentID ||
        !userAddress
      ) {
        throw new CustomError(
          "Invalid token ID, agent ID, user address or credit amount",
          400
        );
      }

      // Get agent from MongoDB
      const agent = await this.agent.findOne({ _id: agentID });
      if (!agent) {
        throw new CustomError("Agent not found", 404);
      }

      // Verify user exists
      let user = await this.user.findOne({
        walletAddress: userAddress.toLowerCase(),
      });

      if (!user)
        throw new CustomError(
          "User account not found. Please connect your wallet address to continue.",
          404
        );

      // IMPORTANT: Instead of using the database value, query the actual cost from the contract
      // Create a provider to connect to the blockchain
      const provider = new ethers.JsonRpcProvider(this.rpcUrl);

      // Create contract instance
      const contract = new ethers.Contract(this.contractAddress, ABI, provider);

      // Get the actual credit cost from the contract
      const creditCost = await contract.getAgentCreditCost(tokenId);

      // Calculate total cost using BigInt to handle large numbers precisely
      const totalCostInWei = creditCost * BigInt(creditAmount);

      // Return transaction data for frontend
      return {
        contractAddress: this.contractAddress,
        contractABI: ABI,
        method: "buyCredit",
        params: [tokenId, creditAmount],
        value: totalCostInWei.toString(),
        agentID,
        creditAmount,
        userAddress,
      };
    } catch (err) {
      console.error("Prepare buy credits error:", err);
      throw new CustomError(
        err.message || "Failed to prepare buy credits transaction",
        500
      );
    }
  }

  /**
   * Records a successful credit purchase in the database
   */
  async recordCreditPurchase(
    txHash,
    agentID,
    tokenId,
    creditAmount,
    userAddress,
    gasFee,
    gasFeeInEth
  ) {
    try {
      // Get agent details
      const agent = await this.agent.findOne({ _id: agentID });
      if (!agent) {
        throw new CustomError("Agent not found", 404);
      }

      // Get user details
      let user = await this.user.findOne({
        walletAddress: userAddress.toLowerCase(),
      });

      if (!user) {
        throw new CustomError("User not found", 404);
      }

      // Find existing credit record or create new one
      let userCredit = await this.credit.findOne({
        walletAddress: userAddress.toLowerCase(),
        agent: agentID,
        user: user._id,
      });

      if (userCredit) {
        userCredit.totalCredits += creditAmount;
        await userCredit.save();
      } else {
        userCredit = new this.credit({
          walletAddress: userAddress.toLowerCase(),
          agent: agentID,
          totalCredits: creditAmount,
          creditsUsed: 0,
          tokenId: tokenId,
          creditsCostPerRequest: agent.rentingDetails.creditCostPerReq,
          user: user._id,
          history: [
            {
              type: "Purchased",
              amount: creditAmount,
              reason: "Purchased new credits",
              timestamp: new Date().toISOString(),
              gasFree: gasFee,
              transactionHash: txHash,
            },
          ],
        });
        await userCredit.save();
      }

      const accessToken = await jwt.sign(
        { userCreditID: userCredit._id, userID: user._id },
        process.env.JWT_SECRET
      );
      userCredit.accessToken = accessToken;
      await userCredit.save();

      return {
        success: true,
        accessToken,
        credits: userCredit.totalCredits,
      };
    } catch (err) {
      console.error("Record credit purchase error:", err);
      throw new CustomError(
        err.message || "Failed to record credit purchase",
        500
      );
    }
  }

  /**
   * Prepares transaction data for buying an NFT
   */
  async prepareBuyAgentNFT(agentID, tokenId, userAddress) {
    try {
      if (!tokenId || !agentID || !userAddress) {
        throw new CustomError(
          "Invalid token ID, agent ID or user address",
          400
        );
      }

      // Get agent from MongoDB
      const agent = await this.agent.findOne({ _id: agentID });
      if (!agent) {
        throw new CustomError("Agent not found", 404);
      }

      // Check if agent is for sale
      if (!agent.isForSale) {
        throw new CustomError("Agent is not for sale", 400);
      }

      const salePriceInSei = agent.salePrice;

      // Convert SEI to wei for the transaction
      const salePriceInWei = ethers.parseEther(salePriceInSei.toString());

      if (!salePriceInSei) {
        throw new CustomError("Agent sale price not defined", 400);
      }

      // Return transaction data for frontend
      return {
        contractAddress: this.contractAddress,
        contractABI: ABI,
        method: "buyAgent",
        params: [tokenId],
        value: salePriceInWei.toString(),
        agentID,
      };
    } catch (err) {
      console.error("Prepare buy agent NFT error:", err);
      throw new CustomError(
        err.message || "Failed to prepare buy agent NFT transaction",
        500
      );
    }
  }

  /**
   * Records a successful NFT purchase in the database
   */
  async recordNFTPurchase(txHash, agentID, userAddress, gasFee, gasFeeInEth) {
    try {
      // Get agent from MongoDB
      const agent = await this.agent.findOne({ _id: agentID });
      if (!agent) {
        throw new CustomError("Agent not found", 404);
      }

      let user = await this.user.findOne({
        walletAddress: userAddress.toLowerCase(),
      });

      // Update agent ownership
      agent.owner = user._id;
      agent.isForSale = false; // Optional: Mark as no longer for sale
      agent.ownershipHistory = [
        ...agent.ownershipHistory,
        {
          owner: userAddress,
          type: "Purchased",
          timestamp: new Date().toISOString(),
          gasFree: gasFee,
          transactionHash: txHash,
        },
      ];

      await agent.save();

      return {
        success: true,
      };
    } catch (err) {
      console.error("Record NFT purchase error:", err);
      throw new CustomError(
        err.message || "Failed to record NFT purchase",
        500
      );
    }
  }

  async prepareUpdateAgent(
    agentID,
    tokenId,
    newCreditCost,
    newSalePrice,
    forSale,
    walletAddress
  ) {
    try {
      if (!tokenId || !agentID || !walletAddress) {
        throw new CustomError("Invalid input parameters", 400);
      }

      // Verify agent exists
      const agent = await this.agent.findOne({ _id: agentID });
      if (!agent) {
        throw new CustomError("Agent not found", 404);
      }

      // const costPerCredit = ethers.parseEther(
      //   `${newCreditCost}`
      // );
      // Verify user exists
      const user = await this.user.findOne({
        walletAddress: walletAddress.toLowerCase(),
      });

      if (!user) {
        throw new CustomError(
          "User account not found. Please connect your wallet address to continue.",
          404
        );
      }

      return {
        contractAddress: this.contractAddress,
        contractABI: ABI,
        method: "updateAgentInfo",
        params: [tokenId, newCreditCost, newSalePrice, forSale],
        agentID,
        tokenId,
        walletAddress,
      };
    } catch (err) {
      console.error("Prepare update agent error:", err);
      throw new CustomError(
        err.message || "Failed to prepare update agent transaction",
        err.statusCode || 500
      );
    }
  }

  /**
   * Confirm agent update after successful blockchain transaction
   */
  /**
   * Confirm agent update after successful blockchain transaction
   */
  async confirmAgentUpdate(
    transactionHash,
    agentID,
    tokenId,
    newCreditCost,
    newSalePrice,
    forSale,
    walletAddress,
    gasFee,
    gasFeeInEth
  ) {
    try {
      if (!transactionHash || !agentID || !tokenId || !walletAddress) {
        throw new CustomError("Invalid input parameters", 400);
      }

      // Verify transaction on blockchain
      const txReceipt = await this.provider.getTransactionReceipt(
        transactionHash
      );
      if (!txReceipt || txReceipt.status !== 1) {
        throw new CustomError(
          "Transaction failed or not found on blockchain",
          400
        );
      }

      // Update agent in database
      const agent = await this.agent.findOne({ _id: agentID });
      if (!agent) {
        throw new CustomError("Agent not found", 404);
      }

      // Update agent details based on actual schema fields
      // Update credit cost
      if (agent.rentingDetails) {
        agent.rentingDetails.costPerCredit = newCreditCost;
      } else {
        agent.rentingDetails = {
          costPerCredit: Number(ethers.formatEther(newCreditCost)),
          creditCostPerReq: agent.rentingDetails?.creditCostPerReq || 1,
        };
      }

      // Update sale price and status
      agent.isForSale = forSale;
      agent.salePrice = newSalePrice;

      // Add to ownership history
      agent.ownershipHistory = agent.ownershipHistory || [];
      agent.ownershipHistory.push({
        owner: walletAddress.toLowerCase(),
        type: "Updated", // Adding a new event type for price updates
        timestamp: new Date(),
        gasFee: Number(gasFeeInEth),
        transactionHash: transactionHash,
      });

      // Save to database
      await agent.save();

      return {
        success: true,
        message: "Agent information updated successfully",
        agent: {
          id: agent._id,
          tokenId: agent.tokenId,
          rentingDetails: agent.rentingDetails,
          isForSale: agent.isForSale,
          salePrice: agent.salePrice,
        },
      };
    } catch (err) {
      console.error("Confirm agent update error:", err);
      throw new CustomError(
        err.message || "Failed to confirm agent update",
        err.statusCode || 500
      );
    }
  }
}

export default WalletService;
