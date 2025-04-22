# 🤖 Decentralized AI Agent Marketplace on SEI
### Empowering AI creators & users through crypto-native access

---

## 🔍 1. The Problem  

AI is reshaping the world, but access remains centralized and unfair:

- 🏦 Centralized platforms control AI distribution and monetization  
- 💡 Independent developers struggle to earn from their AI creations  
- 🔒 No **decentralized**, **transparent**, or **crypto-native** system exists to discover and use AI tools


---

<br>


## 💡 2. The Solution  

SeiAgents - A decentralized platform where users can **rent or own AI agents** using $SEI on the **Sei blockchain**:

- 💳 Users **purchase credits via smart contracts** to interact with AI agents (e.g., access APIs, generate content)  
- 🧠 Developers list AI agents, which users can **buy as NFTs** to own exclusive or enhanced access  
- 🔐 Access to agents is granted after on-chain verification, while the agents run off-chain for speed and scalability  

> ⚡ Own it. Rent it. Use it — all on-chain.

---

<br>

## 🚀 3. Features  

- 🛍️ **AI Agent Marketplace** – Discover and rent AI agents for various tasks  
- 🧠 **NFT Agent Ownership** – Buy and trade agents as NFTs with embedded access rights  
- 💳 **Credit-Based Access** – Use credits (purchased via smart contracts) to access agents without full ownership  
- 🔐 **Secure Access Control** – On-chain validation, off-chain speed  
- ⚙️ **Off-Chain Execution** – Scalable agent performance via external APIs or services  

---

<br>

## 🔮 4. What’s Next  
- 🌟 **Reputation & Review System**  
- 🔁 **Subscription Models via Smart Contracts**  
- 🧾 **Royalty Mechanisms for Developers**

---

<br>

## 🌍 5. Ecosystem Impact  

| Stakeholder       | Value Delivered                                                                 |
|-------------------|----------------------------------------------------------------------------------|
| 👨‍💻 Developers     | Monetize AI globally without middlemen                                           |
| 🙋 Users           | Seamless access to powerful bots using $SEI                                      |
| 🌐 Sei Blockchain  | Expands $SEI utility beyond DeFi into the AI economy layer                       |

---

<br>


## ⚡ 6. Why Sei?  

| Sei Feature           | What It Enables                                                              |
|-----------------------|------------------------------------------------------------------------------|
| 🚀 Parallel Execution | Scalable bot and NFT transactions                                             |
| ⚡ Fast Finality       | Instant credit purchases and agent access                                    |
| 💸 Low Gas Fees        | Enables microtransactions and real-time interactions                         |

---

<br>

## 🛠️ 7. Tech Stack  
- **Frontend**: React with MetaMask integration
- **Payments**: Smart contracts built with Solidity
- **Bot Hosting**: Off-chain using cloud servers, APIs, and containers
- **Blockchain**: SEI Blockchain
- **Backend**: Node.js with Ethers.js for wallet instance management

---

<br>

## 🤩 8. Getting Started

### 8.1 Clone the Repository

Run the following command in your terminal:

```bash
git clone https://github.com/aayushsingh7/ai-agent-marketplace.git
```

---

### 8.2 Project Structure

After cloning, you’ll find two main directories:

- `client/` – Frontend (React)
- `server/` – Backend (Node.js + Smart Contract interaction)

---

### 📦 8.3 Setting Up the Frontend (Client)

1. Navigate to the client folder:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `client/` directory:
   ```env
   VITE_API_URL="http://localhost:4000/api/v1"
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

---

### 🛠️ 8.4 Setting Up the Backend (Server)

1. Navigate to the server folder:
   ```bash
   cd ../server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `server/` directory:
   ```env
   JWT_SECRET=YOUR_JWT_SECRET_HERE
   MONGODB_URI=YOUR_MONGODB_URI_HERE
   MINTER_PRIVATE_KEY=YOUR_MINTER_PRIVATE_KEY_HERE  # Metamask private key to mint on behalf of users
   RPC_URL=https://evm-rpc-testnet.sei-apis.com
   NODE_ENV=development
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

---
