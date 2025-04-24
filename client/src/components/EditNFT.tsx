import { FC, useEffect, useState } from "react";
import styles from "../styles/pages/Upload.module.css";
import Input from "./ui/Input";
import CheckBox from "./ui/CheckBox";
import { useAppContext } from "../context/contextAPI";
import Button from "./ui/Button";
import { ethers } from "ethers";
import Notification from "../utils/notification";

interface EditNFTProps {}

const EditNFT: FC<EditNFTProps> = ({}) => {
    const {editNFT,selectedAgent,setEditNFT, setIsProcessing, setProcessingText,loggedInUser} = useAppContext()
   const [newCostPerCredit, setNewCostPerCredit] = useState<number>(0);
  const [newSalePrice, setNewSalePrice] = useState<number>(0);
  const [newIsForSale, setNewIsForSale] = useState<boolean>(false);
  const [newCreditCostPerRequest, setNewCreditCostPerRequest] =useState<number>(0);
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState("");

  useEffect(() => {
    setNewCostPerCredit(selectedAgent?.rentingDetails?.costPerCredit);
    setNewSalePrice(selectedAgent?.salePrice);
    setNewIsForSale(selectedAgent?.isForSale);
    setNewCreditCostPerRequest(selectedAgent?.rentingDetails?.creditCostPerReq);
  }, [selectedAgent,editNFT]);

  const updateAgentInfo = async () => {
    //@ts-ignore
    if (!window.ethereum) {
      Notification.error(
        "MetaMask is not installed. Please install it to use this app."
      );
      setError("MetaMask is not installed. Please install it to use this app.");
      return;
    }

    try {
      setProcessingText("Processing...");
      setIsProcessing(true);
      setError("");

      // Get the user's wallet
      //@ts-ignore
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      const loggedInUserWallet = loggedInUser?.walletAddress;
      const signerWallet = address;

      if (loggedInUserWallet.toLowerCase() != signerWallet.toLowerCase()) {
        Notification.error("Please use the Wallet you signed in with");
        Notification.info(
          "Maybe you have selected different account in metamask wallet"
        );
        return;
      }

      // Step 1: Get transaction data from backend
      const prepareResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/wallets/prepare-update-agent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agentID: selectedAgent?._id,
            tokenID: selectedAgent?.tokenId,
            newCostPerCredit: newCostPerCredit,
            newSalePrice: newSalePrice,
            newIsForSale: newIsForSale,
            newCreditCostPerRequest: newCreditCostPerRequest,
            walletAddress: address,
          }),
          credentials: "include",
        }
      );

      if (!prepareResponse.ok) {
        const data = await prepareResponse.json();
        throw new Error(data.message || "Failed to prepare transaction");
      }

      const txData = await prepareResponse.json();
      console.log("Transaction data:", txData.data.method);

      // Step 2: Create contract instance
      const contract = new ethers.Contract(
        txData.data.contractAddress,
        txData.data.contractABI,
        signer
      );

      console.log("exicuting the transaction");
      // Step 3: Execute the transaction
      const tx = await contract[txData.data.method](...txData.data.params);
      setTxHash(tx.hash);

      console.log("transaction done", tx.hash);

      // Step 4: Wait for confirmation
      const receipt = await tx.wait();

      // Calculate gas fee
      const gasUsed = receipt.gasUsed;
      const gasPrice = receipt.gasPrice || receipt.effectiveGasPrice;
      const gasFee = gasUsed * gasPrice;
      const gasFeeInEth = ethers.formatEther(gasFee);

      // console.log("Hello world");

      console.log("Gas Fee:", gasFeeInEth, "ETH");

      console.log({
        tokenID: selectedAgent.tokenId,
        newCostPerCredit: txData.data.newCostPerCredit,
        newSalePrice: txData.data.newSalePrice,
        newIsForSale: txData.data.newIsForSale,
        newCreditCostPerRequest: txData.data.newCreditCostPerRequest,
      })

      // Step 5: Inform backend of successful update
      const confirmResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/wallets/confirm-agent-update`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transactionHash: receipt.hash,
            agentID: selectedAgent._id,
            tokenID: selectedAgent.tokenId,
            newCostPerCredit: txData.data.newCostPerCredit,
            newSalePrice: txData.data.newSalePrice,
            newIsForSale: txData.data.newIsForSale,
            newCreditCostPerRequest: txData.data.newCreditCostPerRequest,
            walletAddress: address,
            gasFee: gasFee.toString(),
            gasFeeInEth: gasFeeInEth,
          }),
          credentials: "include",
        }
      );

      if (!confirmResponse.ok) {
        const data = await confirmResponse.json();
        throw new Error(data.message || "Failed to confirm update");
      }

      const result = await confirmResponse.json();
      Notification.success("Agent info updated successfully");

      // Refresh agent details if needed
      //   if (onUpdate) onUpdate();
    } catch (err: any) {
      console.error("Update agent error:", err);
      Notification.error(err.message || "Failed to update agent info");
      setError(err.message || "Failed to update agent info");
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <div className="rgba" onClick={()=> setEditNFT(()=> false)}>
      <div className={`edit_nft_box ${styles.upload_page}`} onClick={(e)=> e.stopPropagation()}>
        <h4>Edit NFT Details</h4>
        <div style={{marginTop:"50px"}}>
          <div className={styles.input_field}>
            <CheckBox
              description={
                "By checking it, you will be able to sell your agents as NFTs"
              }
              changeCheckBoxStatus={setNewIsForSale}
              checkBoxStatus={newIsForSale}
              text="Sell Agent As NFT"
            />

            <div className={styles.input_field} style={{marginTop:"20px"}}>
              <span>Enter Agent Selling Price ($SEI Token QTY)</span>
              <Input
                onChange={(e) => setNewSalePrice(parseInt(e.target.value))}
                placeholder=""
                type="number"
                min={1}
                max={1000}
                step={1}
                defaultValue={selectedAgent?.salePrice}
              />
            </div>

            <div className={styles.input_field}>
              <span>
                Cost Per Credit (how many sei is reqiured to buy 1 credit)
              </span>
              <Input
                //  value={costPerCredit}
                onChange={(e) => setNewCostPerCredit(parseFloat(e.target.value))}
                type="number"
                min={0.001}
                max={0.08}
                defaultValue={selectedAgent?.rentingDetails?.costPerCredit}
                step={0.001}
              />
            </div>

            <div className={styles.input_field}>
              <span>
                Credit Cost Per Request (how many credit require to send 1 request)
              </span>
              <Input
                //  value={costPerCredit}
                onChange={(e) => setNewCreditCostPerRequest(parseFloat(e.target.value))}
                type="number"
                min={0.001}
                max={0.08}
                defaultValue={selectedAgent?.rentingDetails?.creditCostPerReq}
                step={0.001}
              />
            </div>
          </div>
        </div>

        <Button onClick={updateAgentInfo} className={styles.main_button}>Save Changes</Button>
      </div>
    </div>
  );
};

export default EditNFT;
