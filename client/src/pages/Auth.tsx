// Auth.js
import { useState } from "react";

export default function Auth() {
  const [walletAddress, setWalletAddress] = useState("");

  const connectWallet = async () => {
    const chainId = "atlantic-2"; // Sei Testnet Chain ID
  
    try {
      // Check if Compass wallet is installed
      //@ts-ignore
      if (!window.compass) {
        alert("Compass wallet extension not found. Please install it first.");
        return;
      }
  
      // Enable the Sei chain in Compass
      //@ts-ignore
      await window.compass.enable(chainId);
      
      // Get the offline signer for signing transactions
      //@ts-ignore
      const offlineSigner = window.compass.getOfflineSigner(chainId);
      const accounts = await offlineSigner.getAccounts();
      const address = accounts[0].address;
      setWalletAddress(address);
  
      // 1. Get nonce from backend
      const res = await fetch(`http://localhost:5000/auth/nonce?address=${address}`);
      const { nonce } = await res.json();
  
      // 2. Sign the nonce with Compass wallet
      //@ts-ignore
      const signed = await window.compass.signArbitrary(chainId, address, nonce);
  
      console.log({address, nonce, signature: signed.signature})
  
      // 3. Send signature to backend for verification
      // const verifyRes = await fetch(`http://localhost:5000/auth/verify`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ address, nonce, signature: signed.signature }),
      // });
  
      // const data = await verifyRes.json();
      // if (data.success) {
      //   alert("✅ Login successful!");
      // } else {
      //   alert("❌ Verification failed.");
      // }
  
    } catch (err) {
      console.error("Error connecting wallet:", err);
      alert("Failed to connect wallet. Please check if Compass is installed and try again.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Connect Wallet to Continue</h2>
      <button onClick={connectWallet}>Connect Compass Wallet</button>
      {walletAddress && <p>Connected Wallet: {walletAddress}</p>}
    </div>
  );
}
