# AI Agent Marketplace Smart Contract

A Solidity smart contract for creating, selling, and using AI agents as NFTs on the SEI blockchain.

## Overview

This smart contract implements an NFT-based marketplace where AI agents can be:
- Minted as NFTs with specific usage costs
- Bought and sold for SEI tokens
- Used by purchasing credits

## Features

- Create AI agent NFTs with customizable metadata
- Set credit costs for using agents
- Buy/sell agents directly
- Purchase usage credits
- Update agent pricing parameters
- Track credit balances

## Prerequisites

- Node.js (v16+)
- npm or yarn
- Hardhat

## Installation

1. Clone the repository
2. **Make sure to navigate to `smart-contract` directory before following the below steps.**
3. Install dependencies:
```bash
npm install
```

## Environment Setup

Create a `.env` file in the root directory with:

```
PRIVATE_KEY=your_wallet_private_key
SEI_TESTNET_URL=your_sei_testnet_rpc_url
```

## Contract Details

- Built with Solidity 0.8.20
- Uses OpenZeppelin v5.0.0 for:
  - ERC721 implementation
  - ReentrancyGuard for security
  - Ownable for access control

## Deployment

To deploy the smart contract to SEI Testnet:

```bash
npx hardhat run scripts/deploy.js --network seiTestnet
```

## Key Functions

- `createAgent`: Mint a new AI agent NFT
- `updateAgentInfo`: Update an agent's pricing and availability
- `buyCredit`: Purchase usage credits for an agent
- `buyAgent`: Buy an agent NFT directly
- `useAgent`: Consume credits to use an agent

## Security Features

- ReentrancyGuard to prevent reentrancy attacks
- Access control for agent modifications
- Safe payment handling

## Dependencies

```json
{
  "devDependencies": {
    "@nomicfoundation/hardhat-toolbox": "^5.0.0",
    "hardhat": "^2.23.0"
  },
  "dependencies": {
    "@openzeppelin/contracts": "^5.0.0",
    "@openzeppelin/contracts-upgradeable": "^5.3.0",
    "dotenv": "^16.5.0"
  }
}
```

## License

MIT