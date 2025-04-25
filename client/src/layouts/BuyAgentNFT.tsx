import { ethers } from "ethers";
import { FC, useState } from "react";
import AgentBox from "../components/AgentBox";
import PaymentBill from "../components/PaymentBill";
import { useAppContext } from "../context/contextAPI";
import styles from "../styles/layouts/BuyAgentNFT.module.css";
import Notification from "../utils/notification";
import formatDate from "../utils/formatDate";

interface BuyAgentNFTProps {}

const BuyAgentNFT: FC<BuyAgentNFTProps> = ({}) => {
  const {
    selectedAgent,
    setShowBuyAgent,
    setIsProcessing,
    setProcessingText,
    loggedInUser,
  } = useAppContext();

  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState("");

  const buyAgentNFTFunc = async () => {
    //@ts-ignore
    if (!window.ethereum) {
      Notification.error(
        "MetaMask is not installed. Please install it to use this app."
      );
      setError("MetaMask is not installed. Please install it to use this app.");
      return;
    }

    try {
      setIsProcessing(true);
      setError("");
      setProcessingText("Preparing Transaction...");

      //@ts-ignore
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      if (address.toLowerCase() !== loggedInUser?.walletAddress) {
        Notification.error("Please select the wallet you are logged in with");
        return;
      }

      // Step 1: Get transaction data from backend
      const prepareResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/wallets/prepare-buy-nft`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agentID: selectedAgent._id,
            tokenID: selectedAgent.tokenId,
            walletAddress: address,
          }),
          credentials: "include",
        }
      );

      if (!prepareResponse.ok) {
        const data = await prepareResponse.json();
        Notification.error("Failed to prepare transaction");
        throw new Error(data.error || "Failed to prepare transaction");
      }

      const txData = await prepareResponse.json();

      const contract = new ethers.Contract(
        txData.data.contractAddress,
        txData.data.contractABI,
        signer
      );

      setProcessingText("Executing The Transaction...");
      const tx = await contract[txData.data.method](...txData.data.params, {
        value: txData.data.value,
      });

      setTxHash(tx.hash);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed;
      const gasPrice = receipt.gasPrice || receipt.effectiveGasPrice;
      const gasFee = gasUsed * gasPrice;

      const gasFeeInEth = ethers.formatEther(gasFee);
      setProcessingText("Confirming the Transaction...");
      const confirmResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/wallets/confirm-nft-purchase`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transactionHash: receipt.hash,
            agentID: selectedAgent._id,
            walletAddress: address,
            gasFee: gasFee.toString(),
            gasFeeInEth,
          }),
          credentials: "include",
        }
      );

      const data = await confirmResponse.json();
      if (!confirmResponse.ok) {
        Notification.error("Failed to confirm purchase");
        throw new Error(data.error || "Failed to confirm purchase");
      }
      Notification.success("Transaction Completed Successfully");
      Notification.info("Please refresh the page to see changes");
    } catch (err: any) {
      const revertMessage = err?.revert?.args?.[0];
      console.error("Main revert message:", revertMessage);
      Notification.error(revertMessage);
      setError("Failed to buy NFT: " + (err.message || "Unknown error"));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className={styles.rgba_background}
      onClick={() => setShowBuyAgent(() => false)}
    >
      <div
        className={styles.buy_agent_box}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.agent_details}>
          <h2>Buy Agent</h2>
          <AgentBox allowBorder={false} data={selectedAgent} type="normal" />
          <div className={styles.details}></div>

          <div className={styles.more_details}>
            <div className={styles.agent_info}>
              <h4>Agent Info</h4>
              <table className={styles.agent_table}>
                <thead>
                  <tr>
                    <th scope="col">Attribute</th>
                    <th scope="col">Details</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Agent Name:</td>
                    <td>{selectedAgent.name}</td>
                  </tr>
                  <tr>
                    <td>Purpose:</td>
                    <td>{selectedAgent.purpose}</td>
                  </tr>
                  <tr>
                    <td>Is Agent For Sale:</td>
                    <td>{selectedAgent.isForSale}</td>
                  </tr>
                  <tr>
                    <td>Agent Sale Price:</td>
                    <td>{selectedAgent.salePrice}</td>
                  </tr>
                  <tr>
                    <td>Owner Username:</td>
                    <td>{selectedAgent.owner.username || "N/A"}</td>
                  </tr>
                  <tr>
                    <td>Trained On:</td>
                    <td>{selectedAgent.trainedOn}</td>
                  </tr>
                  <tr>
                    <td>Current Status:</td>
                    <td>
                      {selectedAgent.status == 1 ? "Available" : "UnAvailable"}
                    </td>
                  </tr>
                  <tr>
                    <td>Usage License:</td>
                    <td>{selectedAgent.usageLicense}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className={styles.blockchain_info}>
              <h4>Blockchain Details</h4>
              <table className={styles.agent_table}>
                <thead>
                  <tr>
                    <th scope="col">Attribute</th>
                    <th scope="col">Details</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Blockchain:</td>
                    <td>Sei Network</td>
                  </tr>
                  <tr>
                    <td>Transaction Hash:</td>
                    <td>{selectedAgent.ownershipHistory[0].transactionHash}</td>
                  </tr>
                  <tr>
                    <td>Smart Contract:</td>
                    <td>AIAgentMarketplace</td>
                  </tr>

                  <tr>
                    <td>Contract Address:</td>
                    <td>0x35b32b80FBe7526487d1b41c8860F684A7A48cc6</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className={styles.owner_info}>
              <h4 style={{paddingBottom:"10px"}}>Current Owner Details</h4>
              <table className={styles.agent_table}>
                <thead>
                  <tr>
                    <th scope="col">Attribute</th>
                    <th scope="col">Details</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Transaction Type:</td>
                    <td>
                      {
                        selectedAgent.ownershipHistory[
                          selectedAgent.ownershipHistory.length - 1
                        ].type
                      }
                    </td>
                  </tr>
                  <tr>
                    <td>Owner Address:</td>
                    <td>
                      {
                        selectedAgent.ownershipHistory[
                          selectedAgent.ownershipHistory.length - 1
                        ].owner
                      }
                    </td>
                  </tr>
                  <tr>
                    <td>Transaction Hash:</td>
                    <td>
                      {
                        selectedAgent.ownershipHistory[
                          selectedAgent.ownershipHistory.length - 1
                        ].transactionHash
                      }
                    </td>
                  </tr>
                  <tr>
                    <td>Timestamp:</td>
                    <td>
                      {formatDate(
                        selectedAgent.ownershipHistory[
                          selectedAgent.ownershipHistory.length - 1
                        ].timestamp
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <PaymentBill
          type="nft"
          width={"40%"}
          className={styles.payment}
          agent={selectedAgent}
          creditAmount={2000}
          func={buyAgentNFTFunc}
        />
      </div>
    </div>
  );
};

export default BuyAgentNFT;
