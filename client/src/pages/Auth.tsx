import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Page from "../components/Page";
import Button from "../components/ui/Button";
import { useAppContext } from "../context/contextAPI";
import Notification from "../utils/notification";

const API_URL = import.meta.env.VITE_API_URL;

const Auth = () => {
  const {loggedInUser,setLoggedInUser, setVerifyUser} = useAppContext()
  const [walletAddress, setWalletAddress] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState("");
  const [networkName, setNetworkName] = useState("");
  const navigate = useNavigate();
  const [loading,setLoading] = useState<boolean>(false)

  useEffect(()=> {
    if(loggedInUser?._id) navigate("/marketplace")
  },[loggedInUser])

  // Add SEI EVM network to MetaMask
  const addSeiEvmNetwork = async () => {
    // @ts-ignore
    if (typeof window.ethereum === 'undefined') {
      throw new Error("MetaMask is not installed");
    }

    try {
      // @ts-ignore
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0x530', // 1328 in decimal (SEI EVM Testnet)
            chainName: 'Sei',
            nativeCurrency: {
              name: 'SEI',
              symbol: 'SEI',
              decimals: 18
            },
            rpcUrls: ['https://evm-rpc-testnet.sei-apis.com'],
            // blockExplorerUrls: [] // Add if you have a valid testnet explorer URL
          }
        ]
      });
      
      console.log("Successfully added SEI EVM network");
      return true;
    } catch (err:any) {
      console.error('Error adding SEI EVM network:', err);
      throw err;
    }
  };

  // Switch to SEI EVM network
  const switchToSeiEvm = async () => {
    // @ts-ignore
    if (typeof window.ethereum === 'undefined') {
      throw new Error("MetaMask is not installed");
    }

    try {
      // @ts-ignore
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x2BCA' }] // 11210 in hex for SEI EVM Testnet
      });
      console.log("Successfully switched to SEI EVM network");
      return true;
    } catch (err:any) {
      console.error('Error switching network:', err);
      
      // This error code indicates that the chain has not been added to MetaMask
      if (err.code === 4902) {
        console.log("Network not found. Adding network...");
        return addSeiEvmNetwork();
      }
      throw err;
    }
  };

  // Connect wallet - simplified version to identify the error
  const connectWallet = async () => {
    setIsConnecting(true);
    setError("");
    
    try {
      console.log("Starting wallet connection...");
      
      // First, just try to get accounts without network switching
      // @ts-ignore
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      console.log("Connected accounts:", accounts);
      const address = accounts[1];
      setWalletAddress(address);
      
      // Once we have the address, we can try to switch networks
      try {
        await switchToSeiEvm();
        setNetworkName("SEI EVM Testnet");
      } catch (networkErr) {
        console.error("Network switching failed but we can continue:", networkErr);
        // Continue with login even if network switching failed
      }
      
      // Proceed with login
      await handleLogin(address);
    } catch (err:any) {
      console.error("Wallet connection error:", err);
      setError(`Connection failed: ${err.message || JSON.stringify(err)}`);
      setIsConnecting(false);
    }
  };

  // Sign message and login
  const handleLogin = async (address:string) => {
    try {
      console.log("Starting login process for address:", address);
      
      // Step 1: Get nonce from server
      console.log(`Fetching nonce from ${API_URL}/auth/nonce?walletAddress=${address}`);
      const nonceResponse = await fetch(`${API_URL}/auth/nonce?walletAddress=${address}`,{credentials:"include"});
      
      if (!nonceResponse.ok) {
        const errorText = await nonceResponse.text();
        throw new Error(`Failed to get nonce: ${errorText}`);
      }
      
      const nonceData = await nonceResponse.json();
      console.log("Received nonce data:", nonceData.data.nonce);
      
      // Create message to sign
      const msg = `Sign this message to verify your identity. Nonce: ${nonceData.data.nonce}`;
      console.log("Message to sign:", msg);
      
      // Step 2: Sign the message with MetaMask
      console.log("Requesting signature from MetaMask...");
      // @ts-ignore
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        // Make sure params array is in the correct order: [message, address]
        params: [msg, address]
      });
      
      console.log("Obtained signature:", signature);
      
      // Step 3: Verify the signature with the server
      console.log(`Verifying signature at ${API_URL}/auth/verify-signature`);
      const verifyResponse = await fetch(
        `${API_URL}/auth/verify-signature?walletAddress=${address}&signature=${encodeURIComponent(signature)}`,{credentials:"include"}
      );
      
      if (!verifyResponse.ok) {
        const errorText = await verifyResponse.text();
        throw new Error(`Failed to verify signature: ${errorText}`);
      }
      
      const authData = await verifyResponse.json();
      console.log("Authentication successful:", authData);
      
      
      // Step 4: Save token and redirect
      if (authData.token) {
        localStorage.setItem('authToken', authData.token);
        navigate('/marketplace');
        setVerifyUser(true)
        Notification.success("Wallet connected successfully")
        setLoggedInUser(()=> authData.data)
      } else {
        throw new Error('No authentication token received');
      }
    } catch (err:any) {
      Notification.error(err.message)
      setIsConnecting(false);
    }
  };

  return (
    <Page>
     <> 
     {loading ? <h2>Please Wait...</h2> :  <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          height: "90dvh",
        }}
      >
        <h1>Please Connect Your Wallet</h1>
        <p className="fr">
          We now support <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer">MetaMask</a> wallet on SEI EVM Testnet.
        </p>
        
        {error && <p style={{ color: "red" }}>{error}</p>}
        
        {walletAddress ? (
          <div>
            <p>Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</p>
            <p>Network: {networkName || "Unknown"}</p>
          </div>
        ) : (
          <Button
            onClick={connectWallet}
            disabled={isConnecting}
            style={{
              padding: "15px",
              fontSize: "1rem",
              color: "#ffffff",
              background: "#b30000",
              borderRadius: "10px",
              fontFamily: "Special Gothic Expanded One, sans-serif",
            }}
          >
            {isConnecting ? "Connecting..." : "Connect MetaMask"}
          </Button>
        )}
      </div>}
     </>
    </Page>
  );
};

export default Auth;
