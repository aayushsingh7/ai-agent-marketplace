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

  /**
   * Buy credits for using an agent
   * @param {Object} wallet - Ethers wallet instance
   * @param {string} tokenId - ID of the agent to buy credits for
   * @param {number} creditAmount - Number of credits to purchase
   * @param {string} agentID - MongoDB ID of the agent
   * @param {string} [gasLimit] - Optional gas limit override
   * @returns {Object} Transaction receipt
   */
  async buyCredits(wallet, tokenId, creditAmount, agentID, gasLimit) {
    console.log({ tokenId, creditAmount, agentID });
    try {
      if (!tokenId || !creditAmount || creditAmount <= 0 || !agentID) {
        throw new CustomError(
          "Invalid token ID, agent ID or credit amount",
          400
        );
      }

      // Get agent from MongoDB
      const agent = await this.agent.findOne({ _id: agentID });
      if (!agent) {
        throw new CustomError("Agent not found", 404);
      }

      const contract = await this.getContract(wallet);
      let txOptions = {};

      // Make sure the credit cost is available
      if (!agent.rentingDetails || !agent.rentingDetails.costPerCredit) {
        throw new CustomError("Agent credit cost not defined", 400);
      }

      const userAddress = await wallet.getAddress();
      let user = await this.user.findOne({
        walletAddress: userAddress.toLowerCase(),
      });

      if (!user)
       
        throw new CustomError(
          "User account not found. Please connect your wallet address to continue.",
          404
        );

      const totalCostInSei = agent.rentingDetails?.costPerCredit * creditAmount;

      const totalCostInWei = ethers.parseEther(totalCostInSei.toString());

      if (gasLimit) {
        txOptions.gasLimit = gasLimit;
      }

      // Send transaction
      const tx = await contract.buyCredit(tokenId, creditAmount, {
        ...txOptions,
        value: totalCostInWei,
      });

      // Wait for transaction to be mined
      const receipt = await tx.wait();

      // Update user credits in database
      try {
        // const userAddress = await wallet.getAddress();
        // let user = await this.user.findOne({
        //   walletAddress: userAddress.toLowerCase(),
        // });

        // if (!user)
        //   throw new CustomError(
        //     "User account not found. Please connect your wallet address to continue.",
        //     404
        //   );

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
            tokenId: tokenId,
            creditsCostPerRequest: agent.rentingDetails.creditCostPerReq,
            user: user._id,
            history: [
              {
                type: "Purchased",
                amount: creditAmount,
                reason: "Purchased new credits",
                timestamp: new Date().toISOString(),
                gasFree: 0,
                transactionHash: receipt.hash,
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
      } catch (dbErr) {
        console.error("Failed to update user credits in database:", dbErr);
        // We don't throw here as the blockchain transaction was successful
      }

      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        success: true,
      };
    } catch (err) {
      console.error("Buy credits error:", err);
      if (err.code === "INSUFFICIENT_FUNDS") {
        throw new CustomError("Insufficient funds for transaction", 400);
      }
      throw new CustomError(err.message || "Failed to buy credits", 500);
    }
  }

  /**
   * Buy an agent NFT directly
   * @param {Object} wallet - Ethers wallet instance
   * @param {string} tokenId - ID of the agent NFT to purchase
   * @param {string} agentID - MongoDB ID of the agent
   * @param {string} [gasLimit] - Optional gas limit override
   * @returns {Object} Transaction receipt
   */
  async buyAgentNFT(wallet, tokenId, agentID, gasLimit) {
    try {
      if (!tokenId || !agentID) {
        throw new CustomError("Invalid token ID or agent ID", 400);
      }

      // Get agent from MongoDB
      const agent = await this.agent.findOne({ _id: agentID });
      if (!agent) {
        throw new CustomError("Agent not found", 404);
      }

      const contract = await this.getContract(wallet);

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

      // Create transaction options
      const txOptions = {
        value: salePriceInWei,
      };

      // Add gas limit if provided
      if (gasLimit) {
        txOptions.gasLimit = gasLimit;
      }

      // Send transaction
      const tx = await contract.buyAgent(tokenId, txOptions);

      // Wait for transaction to be mined
      const receipt = await tx.wait();

      // Update agent ownership in database
      try {
        const buyerAddress = await wallet.getAddress();

        // Update agent ownership
        agent.owner = buyerAddress.toLowerCase();
        await agent.save();
      } catch (dbErr) {
        console.error("Failed to update agent ownership in database:", dbErr);
        // We don't throw here as the blockchain transaction was successful
      }

      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        success: true,
      };
    } catch (err) {
      console.error("Buy agent NFT error:", err);
      if (err.code === "INSUFFICIENT_FUNDS") {
        throw new CustomError("Insufficient funds to buy NFT", 400);
      }
      throw new CustomError(err.message || "Failed to buy agent NFT", 500);
    }
  }

  //   /**
  //    * Create a new AI agent NFT
  //    * @param {Object} wallet - Ethers wallet instance
  //    * @param {string} recipient - Address that will own the NFT
  //    * @param {string} tokenURI - IPFS URI containing metadata of the agent
  //    * @param {number} creditCost - Cost in credits to use this agent
  //    * @param {number} salePrice - Price in SEI to buy this agent (0 if not for sale)
  //    * @param {boolean} forSale - Whether the agent is available for direct purchase
  //    * @param {Object} agentData - Additional agent data to save in MongoDB
  //    * @param {string} [gasLimit] - Optional gas limit override
  //    * @returns {Object} Transaction receipt and token ID
  //    */
  //   async createAgent(
  //     wallet,
  //     recipient,
  //     tokenURI,
  //     creditCost,
  //     salePrice,
  //     forSale,
  //     agentData = {},
  //     gasLimit
  //   ) {
  //     try {
  //       if (!recipient || !tokenURI) {
  //         throw new CustomError("Required parameters missing", 400);
  //       }

  //       const contract = await this.getContract(wallet);

  //       // Create transaction options
  //       const txOptions = {};

  //       // Add gas limit if provided
  //       if (gasLimit) {
  //         txOptions.gasLimit = gasLimit;
  //       }

  //       // Send transaction
  //       const tx = await contract.createAgent(
  //         recipient,
  //         tokenURI,
  //         creditCost,
  //         salePrice,
  //         forSale,
  //         txOptions
  //       );

  //       // Wait for transaction to be mined
  //       const receipt = await tx.wait();

  //       // Find the AgentCreated event to get the token ID
  //       let tokenId;
  //       for (const log of receipt.logs) {
  //         try {
  //           const parsedLog = contract.interface.parseLog(log);
  //           if (parsedLog && parsedLog.name === "AgentCreated") {
  //             tokenId = parsedLog.args[0]; // The tokenId is the first indexed parameter
  //             break;
  //           }
  //         } catch (e) {
  //           // Skip logs that aren't from our contract
  //           continue;
  //         }
  //       }

  //       // Save agent data to MongoDB
  //       try {
  //         const creatorAddress = await wallet.getAddress();

  //         const newAgent = new this.agent({
  //           owner: recipient.toLowerCase(),
  //           creator: creatorAddress.toLowerCase(),
  //           tokenId: tokenId.toString(),
  //           tokenURI,
  //           isForSale: forSale,
  //           salePrice,
  //           rentingDetails: {
  //             costPerCredit: creditCost
  //           },
  //           ...agentData
  //         });

  //         await newAgent.save();
  //       } catch (dbErr) {
  //         console.error("Failed to save agent to database:", dbErr);
  //         // We don't throw here as the blockchain transaction was successful
  //       }

  //       return {
  //         transactionHash: receipt.hash,
  //         blockNumber: receipt.blockNumber,
  //         tokenId: tokenId.toString(),
  //         success: true,
  //       };
  //     } catch (err) {
  //       console.error("Create agent error:", err);
  //       throw new CustomError(err.message || "Failed to create agent", 500);
  //     }
  //   }

  // /**
  //  * Create a new AI agent NFT
  //  * @param {Object} wallet - Ethers wallet instance
  //  * @param {string} recipient - Address that will own the NFT
  //  * @param {Object} agentData - Additional agent data to save in MongoDB
  //  * @param {number} creditCost - Cost in credits to use this agent
  //  * @param {number} salePrice - Price in SEI to buy this agent (0 if not for sale)
  //  * @param {boolean} forSale - Whether the agent is available for direct purchase
  //  * @param {string} [gasLimit] - Optional gas limit override
  //  * @returns {Object} Transaction receipt and token ID
  //  */
  // async createAgent(
  //   wallet,
  //   recipient,
  //   agentData,
  //   gasLimit
  // ) {
  //   try {
  //     if (!recipient) {
  //       throw new CustomError("Recipient address is required", 400);
  //     }

  //     // Generate a basic tokenURI with agent name if available or use placeholder
  //     const metadataJSON = {
  //       name: agentData.name || "AI Agent",
  //       description: agentData.description || "AI Agent on SEI Blockchain",
  //       attributes: [{ trainedOn: agentData.trainedOn }, { tags: agentData.tags}, { category: agentData.category}],
  //     };

  //     // Convert the metadata to a data URI (base64 encoded)
  //     const metadataString = JSON.stringify(metadataJSON);
  //     const tokenURI = `data:application/json;base64,${Buffer.from(
  //       metadataString
  //     ).toString("base64")}`;

  //     const contract = await this.getContract(wallet);

  //     // Create transaction options
  //     const txOptions = {};

  //     // Add gas limit if provided
  //     if (gasLimit) {
  //       txOptions.gasLimit = gasLimit;
  //     }

  //     // Send transaction
  //     const tx = await contract.createAgent(
  //       recipient,
  //       tokenURI,
  //       agentData.rentingDetails.costPerCredit,
  //       agentData.salePrice,
  //       agentData.isForSale,
  //       txOptions
  //     );

  //     // Wait for transaction to be mined
  //     const receipt = await tx.wait();

  //     // Find the AgentCreated event to get the token ID
  //     let tokenId;
  //     for (const log of receipt.logs) {
  //       try {
  //         const parsedLog = contract.interface.parseLog(log);
  //         if (parsedLog && parsedLog.name === "AgentCreated") {
  //           tokenId = parsedLog.args[0]; // The tokenId is the first indexed parameter
  //           break;
  //         }
  //       } catch (e) {
  //         // Skip logs that aren't from our contract
  //         continue;
  //       }
  //     }

  //     // Save agent data to MongoDB
  //     try {
  //       agentData.ownershipHistory =  [
  //         {
  //           owner:recipient.toLowerCase(),
  //           type:"Minted",
  //           timestamp:new Date().toISOString(),
  //           gasFree: gasLimit,
  //           transactionHash:receipt.hash,
  //         },
  //       ]
  //       const creatorAddress = await wallet.getAddress();
  //       const newAgent = await this.agentService.createAgent({
  //         ...agentData,
  //         creator:creatorAddress.toLowerCase(),
  //         tokenId:tokenId.toString()
  //       })
  //       await newAgent.save();
  //     } catch (dbErr) {
  //       console.error("Failed to save agent to database:", dbErr);
  //       // We don't throw here as the blockchain transaction was successful
  //     }

  //     return {
  //       transactionHash: receipt.hash,
  //       blockNumber: receipt.blockNumber,
  //       tokenId: tokenId.toString(),
  //       success: true,
  //     };
  //   } catch (err) {
  //     console.error("Create agent error:", err);
  //     throw new CustomError(err.message || "Failed to create agent", 500);
  //   }
  // }

  /**
   * Create a new AI agent NFT
   * @param {Object} wallet - Ethers wallet instance that will sign the transaction
   * @param {string} recipient - Address that will own the NFT
   * @param {Object} agentData - Additional agent data to save in MongoDB
   * @param {string} [gasLimit] - Optional gas limit override
   * @returns {Object} Transaction receipt and token ID
   */
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

      // Log transaction parameters for debugging
      console.log("Creating agent with parameters:", {
        recipient,
        tokenURI: tokenURI.substring(0, 50) + "...", // Truncate for logging
        costPerCredit,
        salePrice,
        isForSale,
      });

      // Send transaction to create agent
      const tx = await contract.createAgent(
        recipient,
        tokenURI,
        costPerCredit,
        salePrice,
        isForSale,
        txOptions
      );

      console.log(`Transaction sent: ${tx.hash}`);

      // Wait for transaction to be mined
      const receipt = await tx.wait();
      console.log(`Transaction confirmed in block ${receipt.blockNumber}`);

      console.log(receipt);

      let tokenId;

      // Try to find the AgentCreated event directly
      const agentCreatedEvent = receipt.events?.find(
        (event) => event.event === "AgentCreated"
      );

      if (agentCreatedEvent && agentCreatedEvent.args) {
        // Extract the token ID from the event arguments
        tokenId = agentCreatedEvent.args[0].toString();
        console.log(`Agent created with token ID: ${tokenId}`);
      } else {
        console.log("Named event not found, trying manual parsing...");

        // Fall back to manual log parsing
        for (const log of receipt.logs) {
          try {
            const parsedLog = contract.interface.parseLog(log);
            if (parsedLog && parsedLog.name === "AgentCreated") {
              tokenId = parsedLog.args[0].toString();
              console.log(`Found token ID through manual parsing: ${tokenId}`);
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
        const rentingDetails = [
          { costPerCredit: costPerCredit },
          { creditCostPerReq: agentData.rentingDetails?.creditCostPerReq || 1 },
        ];

        const creator = await this.user.findOne({
          walletAddress: creatorAddress,
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
        console.log(`Agent saved to database with ID: ${newAgent._id}`);
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
  /**
   * Update agent information
   * @param {Object} wallet - Ethers wallet instance
   * @param {string} tokenId - ID of the agent NFT
   * @param {number} newCreditCost - New credit cost
   * @param {number} newSalePrice - New sale price in SEI
   * @param {boolean} isForSale - Whether the agent is for sale
   * @param {string} agentID - MongoDB ID of the agent
   * @param {string} [gasLimit] - Optional gas limit override
   * @returns {Object} Transaction receipt
   */
  async updateAgentInfo(
    wallet,
    tokenId,
    newCreditCost,
    newSalePrice,
    isForSale,
    agentID,
    gasLimit
  ) {
    try {
      if (!tokenId || !agentID) {
        throw new CustomError("Invalid token ID or agent ID", 400);
      }

      // Get agent from MongoDB
      const agent = await this.agent.findOne({ _id: agentID });
      if (!agent) {
        throw new CustomError("Agent not found", 404);
      }

      // Verify ownership
      const userAddress = await wallet.getAddress();
      if (agent.owner.toLowerCase() !== userAddress.toLowerCase()) {
        throw new CustomError("You are not the owner of this agent", 403);
      }

      const contract = await this.getContract(wallet);

      // Create transaction options
      const txOptions = {};

      // Add gas limit if provided
      if (gasLimit) {
        txOptions.gasLimit = gasLimit;
      }

      // Send transaction
      const tx = await contract.updateAgentInfo(
        tokenId,
        newCreditCost,
        newSalePrice,
        isForSale,
        txOptions
      );

      // Wait for transaction to be mined
      const receipt = await tx.wait();

      // Update agent in database
      try {
        agent.isForSale = isForSale;
        agent.salePrice = newSalePrice;
        if (!agent.rentingDetails) {
          agent.rentingDetails = {};
        }
        agent.rentingDetails.costPerCredit = newCreditCost;

        await agent.save();
      } catch (dbErr) {
        console.error("Failed to update agent in database:", dbErr);
        // We don't throw here as the blockchain transaction was successful
      }

      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        success: true,
      };
    } catch (err) {
      console.error("Update agent info error:", err);
      throw new CustomError(
        err.message || "Failed to update agent information",
        500
      );
    }
  }
}

export default WalletService;
