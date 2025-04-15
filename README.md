# 🤖 Decentralized AI Bot Marketplace on Sei

## 🔍 Problem

AI is transforming the world, but:
- **Access to AI models is centralized** — controlled by a few tech giants.
- **Developers struggle to monetize AI bots** without relying on web2 platforms.
- **Users have no transparency** on how AI decisions are made or used.
- **AI model usage data is siloed**, making it impossible to verify ownership, performance, or royalties.

---

## 💡 Solution: A Decentralized AI Bot Marketplace

We present a **Web3 platform for publishing, accessing, and monetizing AI agents** using smart contracts on the Sei blockchain. 

- 🧠 Developers can upload their AI agents and earn usage-based rewards.
- 💼 Users can discover, pay, and use AI bots with full on-chain transparency.
- 🔐 All interactions, ratings, and ownership are immutably recorded on Sei.

---

## ⚙️ Key Features

- 🛒 **AI Bot Store**: Search and discover decentralized AI agents.
- 🔗 **Smart Contract-Driven Access**: Pay-per-use or subscription models via smart contracts.
- 🧾 **On-Chain Usage Logs**: Immutable and verifiable records of each bot’s usage and performance.
- 🎓 **Reputation System**: Bots gain credibility via community ratings stored on-chain.
- 🪙 **NFT Licensing** *(optional)*: Tokenized ownership of AI bots for trading/licensing.

---

## 🌍 Impact on Users

| Stakeholder | Impact |
|-------------|--------|
| 👨‍💻 AI Developers | Monetize AI creations directly, retain ownership, earn royalties |
| 🙋‍♂️ End Users    | Transparent usage, secure payments, access to diverse bots |
| 🛠️ Researchers    | Verify performance metrics, avoid black-box claims |
| 🌐 Communities    | Build shared, composable AI agents for public good |

---


## ⚡ Why Sei?

Sei is the **fastest Layer 1 blockchain**, optimized for trading and high-throughput decentralized applications.

| Sei Feature | Our Use Case |
|-------------|--------------|
| 🚀 Parallel Execution | Real-time bot interaction, no latency |
| 📈 High Throughput    | Scales with thousands of AI requests |
| ⏱️ Low Finality Time  | Instant bot access after payment |
| 💸 Low Fees           | Ideal for microtransactions per bot usage |

---


## 🧠 Benefits for the Sei Ecosystem

- 🎯 **New Use Case Vertical**: Expands Sei beyond DeFi into the AI x Web3 space.
- 🌱 **Developer Engagement**: Encourages AI devs to onboard to Sei.
- 🔁 **More Transactions**: Every bot call is a smart contract execution.
- 💎 **Data On-Chain**: Real-world usage data brings analytics and insights into the ecosystem.
- 🤝 **Composable AI Agents**: Encourages interoperable bot design across dApps.

---

## 🚧 Tech Stack (For Hackathon)

- 🧠 AI Bots (Mocked with OpenAI or local models)
- ⚙️ Smart Contracts (Rust or CosmWasm on Sei)
- 🌐 Frontend: Next.js or Vite + Tailwind
- 📦 Wallet Integration: Leap / Keplr
- 📈 Optional: NFT Minting for bot licenses

---

## 🚀 Getting Started

1. Clone the repo
2. Install dependencies: `npm install`
3. Deploy smart contracts to Sei testnet
4. Run frontend locally: `npm run dev`
5. Connect wallet & start using AI bots!

---

## 🤝 Contributing

Want to add your own AI bot? Reach out or fork the project — let's decentralize intelligence together!

---

## 📜 License

MIT — Open to innovation, transparency, and freedom.




### cosmjs

```js
// Example: Connect SEI wallet
const connectWallet = async () => {
  if (!window.keplr) {
    alert("Install Keplr-compatible wallet like Compass or Fin Wallet");
    return;
  }

  const chainId = "atlantic-2"; // or your target SEI testnet/mainnet chain ID

  await window.keplr.enable(chainId);
  const offlineSigner = window.getOfflineSigner(chainId);
  const accounts = await offlineSigner.getAccounts();

  console.log("Wallet Address:", accounts[0].address);
};
// Send Wallet Address & TX info to Backend (API call).
```

```shell
npm install @cosmjs/stargate @sei-js/core
```

```js
// Broadcast Transaction:
const { SigningStargateClient } = require("@cosmjs/stargate");

const sendTokens = async () => {
  const rpc = "https://rpc.atlantic-2.seinetwork.io"; // SEI testnet RPC
  const client = await SigningStargateClient.connectWithSigner(rpc, signer);

  const result = await client.sendTokens(
    fromAddress,
    toAddress,
    [{ denom: "usei", amount: "100000" }], // 0.1 SEI
    {
      amount: [{ denom: "usei", amount: "5000" }], // gas
      gas: "200000",
    }
  );

  console.log("Transaction result:", result);
};
```