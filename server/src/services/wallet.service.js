import { ethers } from "ethers";
import CustomError from "../utils/customError.js";
import UserCredit from "../database/models/userCredit.model.js";
import Agent from "../database/models/agent.model.js";

// ABI fragment for the AIAgentMarketplace contract
const ABI = [
  "function createAgent(address recipient, string memory tokenURI, uint256 creditCost, uint256 salePrice, bool forSale) public returns (uint256)",
  "function updateAgentInfo(uint256 tokenId, uint256 newCreditCost, uint256 newSalePrice, bool newForSale) public",
  "function getAgentCreditCost(uint256 tokenId) public view returns (uint256)",
  "function getAgentSalePrice(uint256 tokenId) public view returns (uint256)",
  "function isAgentForSale(uint256 tokenId) public view returns (bool)",
  "function buyCredit(uint256 tokenId, uint256 creditAmount) public payable nonReentrant",
  "function buyAgent(uint256 tokenId) public payable nonReentrant",
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
   * @param {number} seiAmount - Number of credits to purchase
   * @param {string} agentID - MongoDB ID of the agent
   * @param {string} [gasLimit] - Optional gas limit override
   * @returns {Object} Transaction receipt
   */
  async buyCredits(wallet, tokenId, seiAmount, agentID, gasLimit) {
    try {
      if (!tokenId || !seiAmount || seiAmount <= 0 || !agentID) {
        throw new CustomError("Invalid token ID, agent ID or credit amount", 400);
      }

      // Get agent from MongoDB
      const agent = await this.agent.findOne({ _id: agentID });
      if (!agent) {
        throw new CustomError("Agent not found", 404);
      }

      const contract = await this.getContract(wallet);

      // Make sure the credit cost is available
      if (!agent.rentingDetails || !agent.rentingDetails.costPerCredit) {
        throw new CustomError("Agent credit cost not defined", 400);
      }

      // Calculate total cost in wei
      const totalCost = ethers.parseEther(seiAmount.toString());

      const txOptions = {
        value: totalCost,
      };

      // Add gas limit if provided
      if (gasLimit) {
        txOptions.gasLimit = gasLimit;
      }

      // Send transaction
      const tx = await contract.buyCredit(tokenId, seiAmount, txOptions);

      // Wait for transaction to be mined
      const receipt = await tx.wait();

      // Update user credits in database
      try {
        const userAddress = await wallet.getAddress();
        
        // Find existing credit record or create new one
        let userCredit = await this.credit.findOne({ 
          userAddress: userAddress.toLowerCase(), 
          agentId: agentID 
        });
        
        if (userCredit) {
          userCredit.credits += seiAmount;
          await userCredit.save();
        } else {
          userCredit = new this.credit({
            userAddress: userAddress.toLowerCase(),
            agentId: agentID,
            credits: seiAmount,
            tokenId: tokenId
          });
          await userCredit.save();
        }
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

      // Get the sale price
      const salePrice = agent.salePrice;
      if (!salePrice) {
        throw new CustomError("Agent sale price not defined", 400);
      }

      // Create transaction options
      const txOptions = {
        value: BigInt(salePrice),
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

/**
 * Create a new AI agent NFT
 * @param {Object} wallet - Ethers wallet instance
 * @param {string} recipient - Address that will own the NFT
 * @param {Object} agentData - Additional agent data to save in MongoDB
 * @param {number} creditCost - Cost in credits to use this agent
 * @param {number} salePrice - Price in SEI to buy this agent (0 if not for sale)
 * @param {boolean} forSale - Whether the agent is available for direct purchase
 * @param {string} [gasLimit] - Optional gas limit override
 * @returns {Object} Transaction receipt and token ID
 */
async createAgent(
    wallet,
    recipient,
    agentData = {},
    creditCost,
    salePrice,
    forSale,
    gasLimit
  ) {
    try {
      if (!recipient) {
        throw new CustomError("Recipient address is required", 400);
      }
  
      // Generate a basic tokenURI with agent name if available or use placeholder
      const metadataJSON = {
        name: agentData.name || "AI Agent",
        description: agentData.description || "AI Agent on SEI Blockchain",
        attributes: []
      };
      
      // Convert the metadata to a data URI (base64 encoded)
      const metadataString = JSON.stringify(metadataJSON);
      const tokenURI = `data:application/json;base64,${Buffer.from(metadataString).toString('base64')}`;
  
      const contract = await this.getContract(wallet);
  
      // Create transaction options
      const txOptions = {};
  
      // Add gas limit if provided
      if (gasLimit) {
        txOptions.gasLimit = gasLimit;
      }
  
      // Send transaction
      const tx = await contract.createAgent(
        recipient,
        tokenURI,
        creditCost,
        salePrice,
        forSale,
        txOptions
      );
  
      // Wait for transaction to be mined
      const receipt = await tx.wait();
  
      // Find the AgentCreated event to get the token ID
      let tokenId;
      for (const log of receipt.logs) {
        try {
          const parsedLog = contract.interface.parseLog(log);
          if (parsedLog && parsedLog.name === "AgentCreated") {
            tokenId = parsedLog.args[0]; // The tokenId is the first indexed parameter
            break;
          }
        } catch (e) {
          // Skip logs that aren't from our contract
          continue;
        }
      }
  
      // Save agent data to MongoDB
      try {
        const creatorAddress = await wallet.getAddress();
        
        const newAgent = new this.agent({
          owner: recipient.toLowerCase(),
          creator: creatorAddress.toLowerCase(),
          tokenId: tokenId.toString(),
          tokenURI,
          isForSale: forSale,
          salePrice,
          rentingDetails: {
            costPerCredit: creditCost
          },
          ...agentData
        });
        
        await newAgent.save();
      } catch (dbErr) {
        console.error("Failed to save agent to database:", dbErr);
        // We don't throw here as the blockchain transaction was successful
      }
  
      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        tokenId: tokenId.toString(),
        success: true,
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
  
  // /**
  //  * Use an agent and deduct credits from user's balance
  //  * @param {Object} wallet - Ethers wallet instance
  //  * @param {string} tokenId - ID of the agent NFT
  //  * @param {string} agentID - MongoDB ID of the agent
  //  * @param {string} [gasLimit] - Optional gas limit override
  //  * @returns {Object} Result of the operation
  //  */
  // async useAgent(wallet, tokenId, agentID, gasLimit) {
  //   try {
  //     if (!tokenId || !agentID) {
  //       throw new CustomError("Invalid token ID or agent ID", 400);
  //     }

  //     const contract = await this.getContract(wallet);
  //     const userAddress = await wallet.getAddress();

  //     // Check credits in the database first
  //     const userCredit = await this.credit.findOne({ 
  //       userAddress: userAddress.toLowerCase(), 
  //       agentId: agentID 
  //     });

  //     if (!userCredit || userCredit.credits <= 0) {
  //       throw new CustomError("Insufficient credits to use this agent", 400);
  //     }

  //     // Create transaction options
  //     const txOptions = {};

  //     // Add gas limit if provided
  //     if (gasLimit) {
  //       txOptions.gasLimit = gasLimit;
  //     }

  //     // Send transaction
  //     const tx = await contract.useAgent(tokenId, txOptions);

  //     // Wait for transaction to be mined
  //     const receipt = await tx.wait();

  //     // Update credits in database
  //     userCredit.credits -= 1; // Deduct one credit for usage
  //     await userCredit.save();

  //     return {
  //       transactionHash: receipt.hash,
  //       blockNumber: receipt.blockNumber,
  //       creditsRemaining: userCredit.credits,
  //       success: true,
  //     };
  //   } catch (err) {
  //     console.error("Use agent error:", err);
  //     throw new CustomError(err.message || "Failed to use agent", 500);
  //   }
  // }

  // /**
  //  * Get user's credit balance for a specific agent
  //  * @param {string} userAddress - Address to check
  //  * @param {string} agentID - MongoDB ID of the agent
  //  * @returns {number} The credit balance
  //  */
  // async getCreditBalance(userAddress, agentID) {
  //   try {
  //     if (!userAddress || !ethers.isAddress(userAddress) || !agentID) {
  //       throw new CustomError("Invalid user address or agent ID", 400);
  //     }

  //     // Check credits in the database
  //     const userCredit = await this.credit.findOne({ 
  //       userAddress: userAddress.toLowerCase(), 
  //       agentId: agentID 
  //     });

  //     if (!userCredit) {
  //       return 0; // No credits found
  //     }

  //     return userCredit.credits;
  //   } catch (err) {
  //     console.error("Get credit balance error:", err);
  //     throw new CustomError(err.message || "Failed to get credit balance", 500);
  //   }
  // }
}

export default WalletService;








// import { ethers } from "ethers";
// import CustomError from "../utils/customError.js";
// import UserCredit from "../database/models/userCredit.model.js";
// import Agent from "../database/models/agent.model.js";

// // ABI fragment for the AIAgentMarketplace contract
// const ABI = [
//   "function createAgent(address recipient, string memory tokenURI, uint256 creditCost, uint256 salePrice, bool forSale) public returns (uint256)",
//   "function updateAgentInfo(uint256 tokenId, uint256 newCreditCost, uint256 newSalePrice, bool newForSale) public",
//   "function getAgentCreditCost(uint256 tokenId) public view returns (uint256)",
//   "function getAgentSalePrice(uint256 tokenId) public view returns (uint256)",
//   "function isAgentForSale(uint256 tokenId) public view returns (bool)",
//   "function buyCredit(uint256 tokenId, uint256 creditAmount) public payable nonReentrant",
//   "function buyAgent(uint256 tokenId) public payable nonReentrant",
//   "function useAgent(uint256 tokenId) public returns (bool)",
//   "function getCreditBalance(address user) public view returns (uint256)",
// ];

// class WalletService {
//   constructor() {
//     this.rpcUrl = "https://evm-rpc-testnet.sei-apis.com";
//     this.contractAddress = "0x35b32b80FBe7526487d1b41c8860F684A7A48cc6";
//     this.chainId = 1328;
//     this.credit = UserCredit;
//     this.agent = Agent

//     // Initialize provider
//     this.provider = new ethers.JsonRpcProvider(this.rpcUrl, {
//       chainId: this.chainId,
//       name: "SEI Testnet",
//     });
//   }

//   // Helper method to get contract instance with signer
//   async getContract(wallet) {
//     if (!wallet) {
//       throw new CustomError("Wallet connection required", 400);
//     }

//     const signer = wallet.connect(this.provider);
//     return new ethers.Contract(this.contractAddress, ABI, signer);
//   }

//   /**
//    * Buy credits for using an agent
//    * @param {Object} wallet - Ethers wallet instance
//    * @param {string} tokenId - ID of the agent to buy credits for
//    * @param {number} creditAmount - Number of credits to purchase
//    * @param {string} [gasLimit] - Optional gas limit override
//    * @returns {Object} Transaction receipt
//    */
//   async buyCredits(wallet, tokenId, creditAmount, gasLimit, agentID) {
//     try {
//       if (!tokenId || !creditAmount || creditAmount <= 0) {
//         throw new CustomError("Invalid token ID or credit amount", 400);
//       }

//       const contract = await this.getContract(wallet);
//       const agent = await this.agent.findOne({_id:agentID})

//       // Calculate total cost in wei
//       const totalCost = agent.rentingDetails.costPerCredit * BigInt(creditAmount);

//       const txOptions = {
//         value: totalCost,
//       };

//       // Add gas limit if provided
//       if (gasLimit) {
//         txOptions.gasLimit = gasLimit;
//       }

//       // Send transaction
//       const tx = await contract.buyCredit(tokenId, creditAmount, txOptions);

//       // Wait for transaction to be mined
//       const receipt = await tx.wait();

//       return {
//         transactionHash: receipt.hash,
//         blockNumber: receipt.blockNumber,
//         success: true,
//       };
//     } catch (err) {
//       console.error("Buy credits error:", err);
//       if (err.code === "INSUFFICIENT_FUNDS") {
//         throw new CustomError("Insufficient funds for transaction", 400);
//       }
//       throw new CustomError(err.message || "Failed to buy credits", 500);
//     }
//   }

//   /**
//    * Buy an agent NFT directly
//    * @param {Object} wallet - Ethers wallet instance
//    * @param {string} tokenId - ID of the agent NFT to purchase
//    * @param {string} [gasLimit] - Optional gas limit override
//    * @returns {Object} Transaction receipt
//    */
//   async buyAgentNFT(wallet, tokenId, gasLimit,agentID) {
//     try {
//       if (!tokenId) {
//         throw new CustomError("Invalid token ID", 400);
//       }

//       const contract = await this.getContract(wallet);

//       // Check if agent is for sale
//       const agent = await this.agent.findOne({_id:agentID});
//       const isForSale = agent.isForSale;
//       if (!isForSale) {
//         throw new CustomError("Agent is not for sale", 400);
//       }

//       // Get the sale price
//       const salePrice = await agent.salePrice;

//       // Create transaction options
//       const txOptions = {
//         value: salePrice,
//       };

//       // Add gas limit if provided
//       if (gasLimit) {
//         txOptions.gasLimit = gasLimit;
//       }

//       // Send transaction
//       const tx = await contract.buyAgent(tokenId, txOptions);

//       // Wait for transaction to be mined
//       const receipt = await tx.wait();

//       return {
//         transactionHash: receipt.hash,
//         blockNumber: receipt.blockNumber,
//         success: true,
//       };
//     } catch (err) {
//       console.error("Buy agent NFT error:", err);
//       if (err.code === "INSUFFICIENT_FUNDS") {
//         throw new CustomError("Insufficient funds to buy NFT", 400);
//       }
//       throw new CustomError(err.message || "Failed to buy agent NFT", 500);
//     }
//   }

//   /**
//    * Create a new AI agent NFT
//    * @param {Object} wallet - Ethers wallet instance
//    * @param {string} recipient - Address that will own the NFT
//    * @param {string} tokenURI - IPFS URI containing metadata of the agent
//    * @param {number} creditCost - Cost in credits to use this agent
//    * @param {number} salePrice - Price in SEI to buy this agent (0 if not for sale)
//    * @param {boolean} forSale - Whether the agent is available for direct purchase
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

//       return {
//         transactionHash: receipt.hash,
//         blockNumber: receipt.blockNumber,
//         tokenId,
//         success: true,
//       };
//     } catch (err) {
//       console.error("Create agent error:", err);
//       throw new CustomError(err.message || "Failed to create agent", 500);
//     }
//   }

//   /**
//    * Update agent information
//    * @param {Object} wallet - Ethers wallet instance
//    * @param {string} tokenId - ID of the agent NFT
//    * @param {number} newCreditCost - New credit cost
//    * @param {number} newSalePrice - New sale price in SEI
//    * @param {boolean} isForSale - Whether the agent is for sale
//    * @param {string} [gasLimit] - Optional gas limit override
//    * @returns {Object} Transaction receipt
//    */
//   async updateAgentInfo(
//     wallet,
//     tokenId,
//     newCreditCost,
//     newSalePrice,
//     isForSale,
//     gasLimit
//   ) {
//     try {
//       if (!tokenId) {
//         throw new CustomError("Invalid token ID", 400);
//       }

//       const contract = await this.getContract(wallet);

//       // Create transaction options
//       const txOptions = {};

//       // Add gas limit if provided
//       if (gasLimit) {
//         txOptions.gasLimit = gasLimit;
//       }

//       // Send transaction
//       const tx = await contract.updateAgentInfo(
//         tokenId,
//         newCreditCost,
//         newSalePrice,
//         isForSale,
//         txOptions
//       );

//       // Wait for transaction to be mined
//       const receipt = await tx.wait();

//       return {
//         transactionHash: receipt.hash,
//         blockNumber: receipt.blockNumber,
//         success: true,
//       };
//     } catch (err) {
//       console.error("Update agent info error:", err);
//       throw new CustomError(
//         err.message || "Failed to update agent information",
//         500
//       );
//     }
//   }

//   /**
//    * Get agent credit cost
//    * @param {string} tokenId - ID of the agent NFT
//    * @returns {BigInt} The credit cost
//    */
//   async getAgentCreditCost(tokenId) {
//     try {
//       if (!tokenId) {
//         throw new CustomError("Invalid token ID", 400);
//       }

//       const contract = new ethers.Contract(
//         this.contractAddress,
//         ABI,
//         this.provider
//       );
//       return await contract.getAgentCreditCost(tokenId);
//     } catch (err) {
//       console.error("Get agent credit cost error:", err);
//       throw new CustomError(
//         err.message || "Failed to get agent credit cost",
//         500
//       );
//     }
//   }

//   /**
//    * Get agent sale price
//    * @param {string} tokenId - ID of the agent NFT
//    * @returns {BigInt} The sale price in SEI
//    */
//   async getAgentSalePrice(tokenId) {
//     try {
//       if (!tokenId) {
//         throw new CustomError("Invalid token ID", 400);
//       }

//       const contract = new ethers.Contract(
//         this.contractAddress,
//         ABI,
//         this.provider
//       );
//       return await contract.getAgentSalePrice(tokenId);
//     } catch (err) {
//       console.error("Get agent sale price error:", err);
//       throw new CustomError(
//         err.message || "Failed to get agent sale price",
//         500
//       );
//     }
//   }

//   /**
//    * Check if agent is for sale
//    * @param {string} tokenId - ID of the agent NFT
//    * @returns {boolean} Whether the agent is for sale
//    */
//   async isAgentForSale(tokenId) {
//     try {
//       if (!tokenId) {
//         throw new CustomError("Invalid token ID", 400);
//       }

//       const contract = new ethers.Contract(
//         this.contractAddress,
//         ABI,
//         this.provider
//       );
//       return await contract.isAgentForSale(tokenId);
//     } catch (err) {
//       console.error("Check if agent is for sale error:", err);
//       throw new CustomError(
//         err.message || "Failed to check if agent is for sale",
//         500
//       );
//     }
//   }

//   /**
//    * Use agent (spend credits)
//    * @param {Object} wallet - Ethers wallet instance
//    * @param {string} tokenId - ID of the agent NFT to use
//    * @param {string} [gasLimit] - Optional gas limit override
//    * @returns {Object} Transaction receipt and whether had enough credits
//    */
//   async useAgent(wallet, tokenId, gasLimit) {
//     try {
//       if (!tokenId) {
//         throw new CustomError("Invalid token ID", 400);
//       }

//       const contract = await this.getContract(wallet);

//       // Create transaction options
//       const txOptions = {};

//       // Add gas limit if provided
//       if (gasLimit) {
//         txOptions.gasLimit = gasLimit;
//       }

//       // Send transaction
//       const tx = await contract.useAgent(tokenId, txOptions);

//       // Wait for transaction to be mined
//       const receipt = await tx.wait();

//       // Parse return value (success)
//       const hasEnoughCredits = receipt.status === 1;

//       return {
//         transactionHash: receipt.hash,
//         blockNumber: receipt.blockNumber,
//         hasEnoughCredits,
//         success: true,
//       };
//     } catch (err) {
//       console.error("Use agent error:", err);
//       throw new CustomError(err.message || "Failed to use agent", 500);
//     }
//   }

//   /**
//    * Get user's credit balance
//    * @param {string} userAddress - Address to check
//    * @returns {BigInt} The credit balance
//    */
//   async getCreditBalance(userAddress) {
//     try {
//       if (!userAddress || !ethers.isAddress(userAddress)) {
//         throw new CustomError("Invalid user address", 400);
//       }

      
//     //   const contract = new ethers.Contract(
//     //     this.contractAddress,
//     //     ABI,
//     //     this.provider
//     //   );
//     //   return await contract.getCreditBalance(userAddress);
//     } catch (err) {
//       console.error("Get credit balance error:", err);
//       throw new CustomError(err.message || "Failed to get credit balance", 500);
//     }
//   }
// }

// export default WalletService;
