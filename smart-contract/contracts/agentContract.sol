// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;  // OpenZeppelin 5.0 recommends at least 0.8.20

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract AIAgentMarketplace is ERC721URIStorage, Ownable, ReentrancyGuard {
    // Using a simple uint256 instead of Counters
    uint256 private _nextTokenId;
    
    // Credit balance for each user
    mapping(address => uint256) public creditBalances;
    
    // Agent metadata
    struct AgentInfo {
        uint256 creditCost;     // Cost in credits per use
        uint256 salePrice;      // Price in SEI tokens to buy the NFT
        bool forSale;           // Whether the agent is for sale
    }
    
    // Mapping from token ID to agent info
    mapping(uint256 => AgentInfo) public agentInfo;
    
    // Events
    event AgentCreated(uint256 indexed tokenId, address indexed owner, string tokenURI, uint256 creditCost, uint256 salePrice);
    event CreditsPurchased(address indexed buyer, address indexed agentOwner, uint256 indexed tokenId, uint256 amount);
    event AgentSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price);
    event AgentPriceUpdated(uint256 indexed tokenId, uint256 newCreditCost, uint256 newSalePrice, bool forSale);
    
    // Updated constructor for Ownable in OpenZeppelin 5.0
    constructor() ERC721("AI Agent NFT", "AGENT") Ownable(msg.sender) {
        // Initialize _nextTokenId to 1 (avoiding tokenId 0)
        _nextTokenId = 1;
    }
    
    /**
     * @dev Creates a new AI agent NFT
     * @param recipient The address that will own the NFT
     * @param tokenURI The IPFS URI containing metadata of the agent
     * @param creditCost The cost in credits to use this agent
     * @param salePrice The price in SEI to buy this agent (0 if not for sale)
     * @param forSale Whether the agent is available for direct purchase
     * @return The token ID of the newly created NFT
     */
    function createAgent(
        address recipient, 
        string memory tokenURI, 
        uint256 creditCost, 
        uint256 salePrice, 
        bool forSale
    ) public returns (uint256) {
        uint256 newTokenId = _nextTokenId;
        _nextTokenId++;
        
        _mint(recipient, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        
        agentInfo[newTokenId] = AgentInfo({
            creditCost: creditCost,
            salePrice: salePrice,
            forSale: forSale
        });
        
        emit AgentCreated(newTokenId, recipient, tokenURI, creditCost, salePrice);
        
        return newTokenId;
    }
    
    /**
     * @dev Updates the agent information (credit cost and sale parameters)
     * @param tokenId The ID of the agent NFT
     * @param newCreditCost The new credit cost
     * @param newSalePrice The new sale price (in SEI)
     * @param newForSale Whether the agent is for sale
     */
    function updateAgentInfo(
        uint256 tokenId, 
        uint256 newCreditCost, 
        uint256 newSalePrice, 
        bool newForSale
    ) public {
        require(_ownerOf(tokenId) != address(0), "Agent does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not the owner of this agent");
        
        agentInfo[tokenId].creditCost = newCreditCost;
        agentInfo[tokenId].salePrice = newSalePrice;
        agentInfo[tokenId].forSale = newForSale;
        
        emit AgentPriceUpdated(tokenId, newCreditCost, newSalePrice, newForSale);
    }
    
    /**
     * @dev Gets the credit cost for using an agent
     * @param tokenId The ID of the agent NFT
     * @return The credit cost
     */
    function getAgentCreditCost(uint256 tokenId) public view returns (uint256) {
        require(_ownerOf(tokenId) != address(0), "Agent does not exist");
        return agentInfo[tokenId].creditCost;
    }
    
    /**
     * @dev Gets the sale price for buying an agent
     * @param tokenId The ID of the agent NFT
     * @return The sale price in SEI tokens
     */
    function getAgentSalePrice(uint256 tokenId) public view returns (uint256) {
        require(_ownerOf(tokenId) != address(0), "Agent does not exist");
        return agentInfo[tokenId].salePrice;
    }
    
    /**
     * @dev Check if an agent is for sale
     * @param tokenId The ID of the agent NFT
     * @return Whether the agent is for sale
     */
    function isAgentForSale(uint256 tokenId) public view returns (bool) {
        require(_ownerOf(tokenId) != address(0), "Agent does not exist");
        return agentInfo[tokenId].forSale;
    }
    
    /**
     * @dev Buy credits to use an agent
     * @param tokenId The ID of the agent to buy credits for
     * @param creditAmount The number of credits to buy
     */
    function buyCredit(uint256 tokenId, uint256 creditAmount) public payable nonReentrant {
        require(_ownerOf(tokenId) != address(0), "Agent does not exist");
        require(creditAmount > 0, "Must buy at least one credit");
        
        address agentOwner = ownerOf(tokenId);
        uint256 creditCost = agentInfo[tokenId].creditCost;
        uint256 totalCost = creditCost * creditAmount;
        
        require(msg.value >= totalCost, "Insufficient payment");
        
        // Increase buyer's credit balance
        creditBalances[msg.sender] += creditAmount;
        
        // Transfer payment to agent owner
        (bool success, ) = payable(agentOwner).call{value: msg.value}("");
        require(success, "Transfer to agent owner failed");
        
        emit CreditsPurchased(msg.sender, agentOwner, tokenId, creditAmount);
    }
    
    /**
     * @dev Buy an agent NFT directly
     * @param tokenId The ID of the agent to buy
     */
    function buyAgent(uint256 tokenId) public payable nonReentrant {
        require(_ownerOf(tokenId) != address(0), "Agent does not exist");
        require(agentInfo[tokenId].forSale, "Agent not for sale");
        
        address seller = ownerOf(tokenId);
        require(msg.sender != seller, "Cannot buy your own agent");
        
        uint256 salePrice = agentInfo[tokenId].salePrice;
        require(msg.value >= salePrice, "Insufficient payment");
        
        // Transfer the NFT to the buyer
        _transfer(seller, msg.sender, tokenId);
        
        // Transfer the payment to the seller
        (bool success, ) = payable(seller).call{value: msg.value}("");
        require(success, "Transfer to seller failed");
        
        emit AgentSold(tokenId, seller, msg.sender, msg.value);
    }
    
    /**
     * @dev Use credits to access an agent
     * @param tokenId The ID of the agent to use
     * @return Whether the user had enough credits
     */
    function useAgent(uint256 tokenId) public returns (bool) {
        require(_ownerOf(tokenId) != address(0), "Agent does not exist");
        uint256 requiredCredits = agentInfo[tokenId].creditCost;
        
        if (creditBalances[msg.sender] >= requiredCredits) {
            creditBalances[msg.sender] -= requiredCredits;
            return true;
        }
        
        return false;
    }
    
    /**
     * @dev Check credit balance
     * @param user The address to check
     * @return The credit balance
     */
    function getCreditBalance(address user) public view returns (uint256) {
        return creditBalances[user];
    }
}