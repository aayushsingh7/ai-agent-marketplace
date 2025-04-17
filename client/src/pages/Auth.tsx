// // Auth.js
// import { useState } from "react";
// import { SigningStargateClient } from "@cosmjs/stargate";

// export default function Auth() {
//   const [walletAddress, setWalletAddress] = useState("");

//   const connectWallet = async () => {
//     const chainId = "atlantic-2"; // Sei Testnet Chain ID
  
//     try {
//       // Check if Compass wallet is installed
//       //@ts-ignore
//       if (!window.compass) {
//         alert("Compass wallet extension not found. Please install it first.");
//         return;
//       }
  
//       // Enable the Sei chain in Compass
//       //@ts-ignore
//       await window.compass.enable(chainId);
      
//       // Get the offline signer for signing transactions
//       //@ts-ignore
//       const offlineSigner = window.compass.getOfflineSigner(chainId);
//       const accounts = await offlineSigner.getAccounts();
//       const address = accounts[0].address;
//       setWalletAddress(address);
  
//       // 1. Get nonce from backend
//       const res = await fetch(`http://localhost:5000/auth/nonce?address=${address}`);
//       const { nonce } = await res.json();
  
//       // 2. Sign the nonce with Compass wallet
//       //@ts-ignore
//       const signed = await window.compass.signArbitrary(chainId, address, nonce);
  
//       console.log({address, nonce, signature: signed.signature})
  
//       // 3. Send signature to backend for verification
//       // const verifyRes = await fetch(`http://localhost:5000/auth/verify`, {
//       //   method: "POST",
//       //   headers: { "Content-Type": "application/json" },
//       //   body: JSON.stringify({ address, nonce, signature: signed.signature }),
//       // });
  
//       // const data = await verifyRes.json();
//       // if (data.success) {
//       //   alert("✅ Login successful!");
//       // } else {
//       //   alert("❌ Verification failed.");
//       // }
  
//     } catch (err) {
//       console.error("Error connecting wallet:", err);
//       alert("Failed to connect wallet. Please check if Compass is installed and try again.");
//     }
//   };




//   return (
//     <div style={{ textAlign: "center", marginTop: "50px" }}>
//       <h2>Connect Wallet to Continue</h2>
//       <button onClick={connectWallet}>Connect Compass Wallet</button>
//       {walletAddress && <p>Connected Wallet: {walletAddress}</p>}
//       <button onClick={handleSend}>Send Fund</button>
//     </div>
//   );
// }


// Give credits to user. Tx Hash: DA06731845381556B9A18130E65BBF5CA54F9CC161605A142610E3897B600510


import React, { useState } from "react";
import { SigningStargateClient } from "@cosmjs/stargate";

const SeiSender = () => {
  const [walletAddress, setWalletAddress] = useState("");

  const connectWallet = async () => {
    const chainId = "atlantic-2";

    //@ts-ignore
    if (!window.compass) {
      alert("Compass wallet extension not found.");
      return;
    }

    try {
      //@ts-ignore
      await window.compass.enable(chainId);
      //@ts-ignore
      const offlineSigner = window.compass.getOfflineSigner(chainId);
      const accounts = await offlineSigner.getAccounts();
      setWalletAddress(accounts[0].address);
      alert(`✅ Connected: ${accounts[0].address}`);
    } catch (err) {
      console.error("Connection error:", err);
      alert("Failed to connect wallet");
    }
  };

  const sendSeiTokens = async (
    fromAddress: string,
    toAddress: string,
    amountSei: number
  ) => {
    const rpcUrl = "https://rpc.atlantic-2.seinetwork.io"; // Stargate RPC
    const chainId = "atlantic-2";

    //@ts-ignore
    const offlineSigner = window.compass.getOfflineSigner(chainId);
    const client = await SigningStargateClient.connectWithSigner(
      rpcUrl,
      offlineSigner
    );

    const amountInMicro = (amountSei * 1_000_000).toString();

    const fee = {
      amount: [{ denom: "usei", amount: "5000" }],
      gas: "200000",
    };

    const result = await client.sendTokens(
      fromAddress,
      toAddress,
      [{ denom: "usei", amount: amountInMicro }],
      fee,
      "Sent from my dApp"
    );

    return result.transactionHash;
  };

  const handleSend = async () => {
    if (!walletAddress) return alert("Wallet not connected");

    const recipient = prompt("Enter recipient wallet address:");
    const amount = prompt("Enter amount in SEI:");

    if (!recipient || !amount) return;

    try {
      const txHash = await sendSeiTokens(
        walletAddress,
        recipient,
        parseFloat(amount)
      );

      alert(`✅ Transaction sent! Hash: ${txHash}`);

      // ✅ Send this txHash to your backend to confirm & give credits
      console.log("Give credits to user. Tx Hash:", txHash);
    } catch (err) {
      console.error("❌ Transaction failed", err);
      alert("❌ Transaction failed. See console for error.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <button onClick={connectWallet}>🔌 Connect Wallet</button>
      <br /><br />
      <button onClick={handleSend}>💸 Send SEI</button>
    </div>
  );
};

export default SeiSender;
