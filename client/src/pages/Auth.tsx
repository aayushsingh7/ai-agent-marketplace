// import React, { useState, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import Page from "../components/Page"; // Assuming this is your page wrapper component
// import Button from "../components/ui/Button"; // Assuming this is your button component

// const API_URL = import.meta.env.VITE_API_URL;

// const Auth = () => {
//   const [walletAddress, setWalletAddress] = useState("");
//   const [isConnecting, setIsConnecting] = useState(false);
//   const [error, setError] = useState("");
//   const [networkName, setNetworkName] = useState("");
//   const navigate = useNavigate();

//   useEffect(() => {
//     // Check if user is already logged in
//     const token = localStorage.getItem("authToken");
//     if (token) {
//       navigate("/dashboard"); // Redirect to dashboard if already logged in
//     }

//     // Check if MetaMask is installed
//     // @ts-ignore
//     if (!window.ethereum) {
//       setError(
//         "MetaMask is not installed. Please install MetaMask to continue."
//       );
//     }
//   }, [navigate]);

//   // Add SEI EVM network to MetaMask
//   const addSeiEvmNetwork = async () => {
//     try {
//       // @ts-ignore
//       await window.ethereum.request({
//         method: "wallet_addEthereumChain",
//         params: [
//           {
//             chainId: "0x530", // 1328 in decimal (SEI EVM Testnet)
//             chainName: "Sei",
//             nativeCurrency: {
//               name: "SEI",
//               symbol: "SEI",
//               decimals: 18,
//             },
//             rpcUrls: ["https://evm-rpc-testnet.sei-apis.com"],
//             // blockExplorerUrls: [] // Add if you have a valid testnet explorer URL
//           },
//         ],
//       });

//       return true;
//     } catch (error) {
//       console.error("Error adding SEI EVM network:", error);
//       throw error;
//     }
//   };

//   // Switch to SEI EVM network
//   const switchToSeiEvm = async () => {
//     try {
//       // @ts-ignore
//       await window.ethereum.request({
//         method: "wallet_switchEthereumChain",
//         params: [{ chainId: "0x2BCA" }], // 11210 in hex for SEI EVM Testnet
//       });
//       return true;
//     } catch (err: any) {
//       // This error code indicates that the chain has not been added to MetaMask
//       if (err.code === 4902) {
//         return addSeiEvmNetwork();
//       }
//       console.error("Error switching network:", error);
//       throw error;
//     }
//   };

//   // Connect wallet
//   const connectWallet = async () => {
//     setIsConnecting(true);
//     setError("");

//     try {
//       // Try to switch to SEI EVM network first
//       await switchToSeiEvm();

//       // Request account access
//       // @ts-ignore
//       const accounts = await window.ethereum.request({
//         method: "eth_requestAccounts",
//       });

//       const address = accounts[0];
//       setWalletAddress(address);
//       setNetworkName("SEI EVM Testnet");

//       // Once connected, automatically proceed with login
//       await handleLogin(address);
//     } catch (err: any) {
//       console.log(err)
//       setError(err.message || "Failed to connect wallet");
//       setIsConnecting(false);
//     }
//   };

//   // Sign message and login
//   const handleLogin = async (address: string) => {
//     try {
//       // Step 1: Get nonce from server
//       const nonceResponse = await fetch(
//         `${API_URL}/auth/nonce?walletAddress=${address}`
//       );

//       if (!nonceResponse.ok) {
//         throw new Error("Failed to get nonce from server");
//       }

//       const { nonce, message } = await nonceResponse.json();

//       // Step 2: Sign the message with MetaMask
//       const msg = `Sign this message to verify your identity. Nonce: ${nonce}`;
//       // @ts-ignore
//       const signature = await window.ethereum.request({
//         method: "personal_sign",
//         params: [msg, address],
//       });

//       // Step 3: Verify the signature with the server
//       const verifyResponse = await fetch(
//         `${API_URL}/auth/verify-signature?walletAddress=${address}&signature=${signature}`
//       );

//       if (!verifyResponse.ok) {
//         throw new Error("Failed to verify signature");
//       }

//       const authData = await verifyResponse.json();

//       // Step 4: Save token and redirect
//       if (authData.token) {
//         localStorage.setItem("authToken", authData.token);
//         navigate("/dashboard");
//       } else {
//         throw new Error("No authentication token received");
//       }
//     } catch (err: any) {
//       setError(err.message || "Login failed");
//       setIsConnecting(false);
//     }
//   };

//   return (
//     <Page>
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           flexDirection: "column",
//           height: "90dvh",
//         }}
//       >
//         <h1>Please Connect Your Wallet</h1>
//         <p className="fr">
//           We now support{" "}
//           <a
//             href="https://metamask.io/download/"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             MetaMask
//           </a>{" "}
//           wallet on SEI EVM Testnet.
//         </p>

//         {error && <p style={{ color: "red" }}>{error}</p>}

//         {walletAddress ? (
//           <div>
//             <p>
//               Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
//             </p>
//             <p>Network: {networkName}</p>
//           </div>
//         ) : (
//           <Button
//             onClick={connectWallet}
//             disabled={isConnecting}
//             style={{
//               padding: "15px",
//               fontSize: "1rem",
//               color: "#ffffff",
//               background: "#b30000",
//               borderRadius: "10px",
//               fontFamily: "Special Gothic Expanded One, sans-serif",
//             }}
//           >
//             {isConnecting ? "Connecting..." : "Connect MetaMask"}
//           </Button>
//         )}
//       </div>
//     </Page>
//   );
// };

// export default Auth;

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Page from "../components/Page";
import Button from "../components/ui/Button";

const API_URL = import.meta.env.VITE_API_URL;

const Auth = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState("");
  const [networkName, setNetworkName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("authToken");
    if (token) {
      navigate("/dashboard");
    }

    // Check if MetaMask is installed
    // @ts-ignore
    if (typeof window.ethereum === 'undefined') {
      setError("MetaMask is not installed. Please install MetaMask to continue.");
    }
  }, [navigate]);

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
      const address = accounts[0];
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
      const nonceResponse = await fetch(`${API_URL}/auth/nonce?walletAddress=${address}`);
      
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
        `${API_URL}/auth/verify-signature?walletAddress=${address}&signature=${encodeURIComponent(signature)}`
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
        navigate('/dashboard');
      } else {
        throw new Error('No authentication token received');
      }
    } catch (err:any) {
      console.error("Login error:", err);
      setError(`Login failed: ${err.message}`);
      setIsConnecting(false);
    }
  };

  return (
    <Page>
      <div
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
      </div>
    </Page>
  );
};

export default Auth;
