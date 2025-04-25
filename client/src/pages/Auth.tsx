import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Page from "../components/Page";
import Button from "../components/ui/Button";
import { useAppContext } from "../context/contextAPI";
import Notification from "../utils/notification";

const API_URL = import.meta.env.VITE_API_URL;

const Auth = () => {
  const { loggedInUser, setLoggedInUser, setVerifyUser } = useAppContext();
  const [walletAddress, setWalletAddress] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState("");
  const [networkName, setNetworkName] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [availableAccounts, setAvailableAccounts] = useState<string[]>([]);
  const [showAccountSelection, setShowAccountSelection] = useState(false);

  useEffect(() => {
    if (loggedInUser?._id) navigate("/marketplace");
  }, [loggedInUser]);

  const addSeiEvmNetwork = async () => {
    // @ts-ignore
    if (typeof window.ethereum === "undefined") {
      throw new Error("MetaMask is not installed");
    }

    try {
      // @ts-ignore
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x530",
            chainName: "Sei",
            nativeCurrency: {
              name: "SEI",
              symbol: "SEI",
              decimals: 18,
            },
            rpcUrls: ["https://evm-rpc-testnet.sei-apis.com"],
          },
        ],
      });

      return true;
    } catch (err: any) {
      console.error("Error adding SEI EVM network:", err);
      throw err;
    }
  };

  const switchToSeiEvm = async () => {
    // @ts-ignore
    if (typeof window.ethereum === "undefined") {
      throw new Error("MetaMask is not installed");
    }

    try {
      // @ts-ignore
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x2BCA" }],
      });

      return true;
    } catch (err: any) {
      console.error("Error switching network:", err);

      if (err.code === 4902) {
        return addSeiEvmNetwork();
      }
      throw err;
    }
  };

  const fetchAccounts = async () => {
    setIsConnecting(true);
    setError("");

    try {
      // @ts-ignore
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      try {
        await switchToSeiEvm();
        setNetworkName("SEI EVM Testnet");
      } catch (networkErr) {
        console.error(
          "Network switching failed but we can continue:",
          networkErr
        );
      }


      setAvailableAccounts(accounts);
      setShowAccountSelection(true);
      setIsConnecting(false);
    } catch (err: any) {
      console.error("Wallet connection error:", err);
      setError(`Connection failed: ${err.message || JSON.stringify(err)}`);
      setIsConnecting(false);
    }
  };

  const selectAccount = async (address: string) => {
    setWalletAddress(address);
    setShowAccountSelection(false);
    
  
    await handleLogin(address);
  };

  const handleLogin = async (address: string) => {
    try {
      const nonceResponse = await fetch(
        `${API_URL}/auth/nonce?walletAddress=${address}`,
        { credentials: "include" }
      );

      if (!nonceResponse.ok) {
        const errorText = await nonceResponse.text();
        throw new Error(`Failed to get nonce: ${errorText}`);
      }

      const nonceData = await nonceResponse.json();
      const msg = `Sign this message to verify your identity. Nonce: ${nonceData.data.nonce}`;
      // @ts-ignore
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [msg, address],
      });

      const verifyResponse = await fetch(
        `${API_URL}/auth/verify-signature?walletAddress=${address}&signature=${encodeURIComponent(
          signature
        )}`,
        { credentials: "include" }
      );

      if (!verifyResponse.ok) {
        const errorText = await verifyResponse.text();
        throw new Error(`Failed to verify signature: ${errorText}`);
      }

      const authData = await verifyResponse.json();

      if (authData.token) {
        localStorage.setItem("authToken", authData.token);
        navigate("/marketplace");
        setVerifyUser(true);
        Notification.success("Wallet connected successfully");
        setLoggedInUser(() => authData.data);
      } else {
        throw new Error("No authentication token received");
      }
    } catch (err: any) {
      Notification.error(err.message);
      setIsConnecting(false);
    }
  };

  const AccountSelectionModal = () => {
    if (!showAccountSelection) return null;
    
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "10px",
            padding: "20px",
            width: "400px",
            maxWidth: "90%",
          }}
        >
          <h2 style={{fontSize:"1rem"}}>Select an Account</h2>
          <p style={{fontSize:"0.7rem",fontWeight:"600",color:"#777777",margin:"10px 0px"}}>Choose one of your MetaMask accounts to connect:</p>
          
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {availableAccounts.map((account) => (
              <div
                key={account}
                style={{
                  padding: "10px",
                  margin: "5px 0",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize:"16px",
                }}
                onClick={() => selectAccount(account)}
              >
                {account.slice(0, 6)}...{account.slice(-4)}
              </div>
            ))}
          </div>
          
          <div style={{ marginTop: "15px", textAlign: "right" }}>
            <Button
              onClick={() => setShowAccountSelection(false)}
              style={{
                padding: "8px 15px",
                fontSize: "0.9rem",
                color: "#000",
                background: "#ddd",
                borderRadius: "5px",
                marginRight: "10px",
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Page width="full">
      <>
        {loading ? (
          <h2>Please Wait...</h2>
        ) : (
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
              We now support{" "}
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
              >
                MetaMask
              </a>{" "}
              wallet on SEI EVM Testnet.
            </p>

            {error && <p style={{ color: "red" }}>{error}</p>}

            {walletAddress ? (
              <div>
                <p>
                  Connected: {walletAddress.slice(0, 6)}...
                  {walletAddress.slice(-4)}
                </p>
                <p>Network: {networkName || "Unknown"}</p>
              </div>
            ) : (
              <Button
                onClick={fetchAccounts}
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
            
            <AccountSelectionModal />
          </div>
        )}
      </>
    </Page>
  );
};

export default Auth;