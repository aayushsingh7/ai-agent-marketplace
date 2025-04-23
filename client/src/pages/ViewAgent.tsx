import { FC, useEffect, useState } from "react";
import Page from "../components/Page";
import styles from "../styles/pages/ViewAgent.module.css";
import Input from "../components/ui/Input";
import AgentBox from "../components/AgentBox";
import SideNav from "../layouts/SideNav";
import MarkdownPreview from "@uiw/react-markdown-preview";
import DropDown from "../components/ui/DropDown";
import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import Button from "../components/ui/Button";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import CheckBox from "../components/ui/CheckBox";
import { useAppContext } from "../context/contextAPI";
import { ethers } from "ethers";
import PaymentBill from "../components/PaymentBill";
import Notification from "../utils/notification";

interface ViewAgentProps {}

const ViewAgent: FC<ViewAgentProps> = ({}) => {
  const {
    loggedInUser,
    setSelectedAgent,
    setShowBuyAgent,
    setIsProcessing,
    setProcessingDescription,
    setProcessingText,
  } = useAppContext();
  const [selectedSection, setSelectedSection] = useState<number>(1);
  const navigate = useNavigate();
  const [agentDetails, setAgentDetails] = useState<any>();
  const params = useParams();
  const [selectedLanguage, setSelectedLanguage] =
    useState<string>("Javascript");
  const [credits, setCredits] = useState<number>(100);

  const [userCredit, setUserCredit] = useState<any>({});
  const [customValue, setCustomValue] = useState<boolean>(false);
  const [requestBody, setRequestBody] = useState(`{
    prompt:"give me the current trading market anaylsis"
    }`);

  const templateCode: any = {
    javascript: `
      fetch("http://localhost:4000/api/v1/agents/use?agentID=${
        agentDetails?._id
      }", {
        method: "${agentDetails?.requestMethod}",
        headers: {
          "Content-Type": "application/json",
          "sei-agents-api-key": "${
           loggedInUser?._id == agentDetails?.owner?._id ? "owner-privilage-" + loggedInUser?._id :  userCredit?.accessToken
              ? userCredit?.accessToken
              : "trail-use-" + loggedInUser?._id
          }"
        },
        credentials: "include",
        body: JSON.stringify(${requestBody})
      })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error("Error:", error));
      `,

    python: `
      import requests
      import json
    
      url = "http://localhost:4000/api/v1/agents/use?agentID=${
        agentDetails?._id
      }"
    
      headers = {
        "Content-Type": "application/json",
        "sei-agents-api-key": "${
         loggedInUser?._id == agentDetails?.owner?._id ? "owner-privilage-" + loggedInUser?._id :  userCredit?.accessToken
            ? userCredit?.accessToken
            : "trail-use-" + loggedInUser?._id
        }"
      }
    
      response = requests.${agentDetails?.requestMethod}(
        url,
        headers=headers,
        data=json.dumps(${requestBody})
      )
    
      print(response.json())
      `,
  };


  useEffect(() => {
    fetchAgentDetails(params.agentID || "");
  }, []);

  useEffect(()=> {
    setRequestBody(JSON.stringify(agentDetails?.requestBody))
  },[agentDetails])

  useEffect(() => {
    fetchUserCredit();
  }, [loggedInUser, agentDetails]);

  const fetchAgentDetails = async (agentID: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/agents/agent/${agentID}`
      );
      const data = await response.json();
      setAgentDetails(data.data);
      setSelectedAgent(data.data);
    } catch (err) {
      Notification.error("Oops! something went wrong while fetching agents");
    }
  };

  const fetchUserCredit = async () => {
    if (!loggedInUser?._id) return;
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/users/${loggedInUser?._id}/agents/${
          agentDetails._id
        }/user-credit`,
        {
          credentials: "include",
        }
      );
      const credit = await response.json();
      setUserCredit(credit.data);
    } catch (err) {
    }
  };

 
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState("");
  const [tryAgentResponse, setTryAgentResponse] = useState<string>("");


  const buyCredits = async () => {
  
    //@ts-ignore
    if (!window.ethereum) {
      Notification.error(
        "MetaMask is not installed. Please install it to use this app."
      );
      setError("MetaMask is not installed. Please install it to use this app.");
      return;
    }

    try {
      setProcessingText("Preparing Transaction...");
      setIsProcessing(true);
      setError("");

      // Get the user's wallet
      //@ts-ignore
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      const balance = await signer.provider.getBalance(
        loggedInUser?.walletAddress
      );
   
      // Step 1: Get transaction data from backend
      const prepareResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/wallets/prepare-buy-credits`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agentID: agentDetails._id,
            tokenID: agentDetails.tokenId,
            creditAmount: credits,
            walletAddress: address,
          }),
          credentials: "include",
        }
      );

      if (!prepareResponse.ok) {
        const data = await prepareResponse.json();
        Notification.error(data.message || "Failed to prepare transaction");
        setIsProcessing(false);
        return;
      }

      const txData = await prepareResponse.json();

    

      // Debug: Check actual credit cost in contract
      const contract = new ethers.Contract(
        txData.data.contractAddress,
        txData.data.contractABI,
        signer
      );

      // Get the actual credit cost from contract for verification
      const actualCreditCost = await contract.getAgentCreditCost("7");

      // IMPORTANT: Calculate the total cost based on the contract's actual credit cost
      const totalCostWei = BigInt(actualCreditCost) * BigInt(credits);

      setProcessingText("Executing The Transaction...");
      // Execute the transaction with the correct value based on contract's credit cost
      const tx = await contract[txData.data.method](...txData.data.params, {
        value: totalCostWei, // Use the cost from the contract, not from backend
      });

      setTxHash(tx.hash);

      // Step 4: Wait for confirmation
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed;
      const gasPrice = receipt.gasPrice || receipt.effectiveGasPrice;

      // Calculate the total gas fee
      const gasFee = gasUsed * gasPrice;

      // Convert to a more readable format if needed
      const gasFeeInEth = ethers.formatEther(gasFee);


      // Step 5: Inform backend of successful purchase
      setProcessingText("Confirming The Transaction...");
      const confirmResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/wallets/confirm-credit-purchase`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transactionHash: receipt.hash,
            agentID: agentDetails._id,
            tokenID: agentDetails.tokenId,
            creditAmount: credits,
            walletAddress: address,
            gasFee: gasFee.toString(),
            gasFeeInEth: gasFeeInEth,
          }),
          credentials: "include",
        }
      );

      if (!confirmResponse.ok) {
        const data = await confirmResponse.json();
        Notification.error("Failed to confirm purchase");
        setIsProcessing(false);
        return;
      }

      const result = await confirmResponse.json();
      Notification.success("Credit purchased successfully");
    } catch (err: any) {
      if (err.code === "CALL_EXCEPTION" && err.action === "estimateGas") {
        Notification.error(
          "Transaction failed — possibly due to insufficient funds or invalid input."
        );
      } else {
        const revertMessage = err?.revert?.args?.[0];
        console.error("Main revert message:", revertMessage);
        Notification.error(revertMessage);
      }
    } finally {
      setIsProcessing(false);
    }
  };
  const tryAgent = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/agents/use?agentID=${
          agentDetails?._id
        }`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "sei-agents-api-key":loggedInUser?._id == agentDetails?.owner?._id ? "owner-privilage-" + loggedInUser?._id :  userCredit?.accessToken
              ? userCredit?.accessToken
              : "trail-use-" + loggedInUser?._id,
          },
          credentials: "include",
        }
      );
      const data = await response.json();
      setTryAgentResponse(data.data);
    } catch (err: any) {
      Notification.error(err.message);
    }
  };

  return (
    <>
      {agentDetails?._id && (
        <div className="flex-page">
          <SideNav
            type="small"
            setTab={setSelectedSection}
            selectedTab={selectedSection}
          />
          <Page width={"calc(100% - 250px)"}>
            <Input
              placeholder="Search Agents (eg: Booking agents, Trading agents, etc..)"
              onKeyDown={(e) =>
                e.key == "Enter" &&
                //@ts-ignore
                navigate(`/marketplace?search=${e.target.value}`)
              }
            />
            <div  className={styles.section_container}>
              {selectedSection == 1 ? (
                <section className={styles.section_one}>
                  <AgentBox
                    data={agentDetails}
                    type="normal"
                    allowBorder={false}
                  />

                 {agentDetails?.owner?.walletAddress != loggedInUser?.walletAddress &&  <div className={styles.agent_option}>
                    {agentDetails.status == 1 && (
                      <Button onClick={() => setSelectedSection(3)}>
                        Rent Agent
                      </Button>
                    )}
                    {agentDetails.isForSale && (
                      <Button onClick={() => setShowBuyAgent(() => true)}>
                        Buy NFT
                      </Button>
                    )}
                  </div>}

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
                            <td>Agent Token ID:</td>
                            <td>{agentDetails?.tokenId || "N/A"}</td>
                          </tr>
                          <tr>
                            <td>Agent Name:</td>
                            <td>{agentDetails.name}</td>
                          </tr>
                          <tr>
                            <td>Purpose:</td>
                            <td>{agentDetails.purpose}</td>
                          </tr>
                          <tr>
                            <td>Is Agent For Sale:</td>
                            <td>{agentDetails.isForSale}</td>
                          </tr>
                          <tr>
                            <td>Agent Sale Price:</td>
                            <td>{agentDetails.salePrice}</td>
                          </tr>
                          <tr>
                            <td>Owner Username:</td>
                            <td>{agentDetails.owner.username || "N/A"}</td>
                          </tr>
                          <tr>
                            <td>Trained On:</td>
                            <td>{agentDetails.trainedOn}</td>
                          </tr>
                          <tr>
                            <td>Current Status:</td>
                            <td>
                              {agentDetails.status == 1
                                ? "Available"
                                : "UnAvailable"}
                            </td>
                          </tr>
                          <tr>
                            <td>Usage License:</td>
                            <td>{agentDetails.usageLicense}</td>
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
                            <td>
                              {agentDetails.ownershipHistory[0].transactionHash}
                            </td>
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
                      <h4>Owner Details</h4>
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
                                agentDetails.ownershipHistory[
                                  agentDetails.ownershipHistory.length - 1
                                ].type
                              }
                            </td>
                          </tr>
                          <tr>
                            <td>Owner Address:</td>
                            <td>
                              {
                                agentDetails.ownershipHistory[
                                  agentDetails.ownershipHistory.length - 1
                                ].owner
                              }
                            </td>
                          </tr>
                          <tr>
                            <td>Transaction Hash:</td>
                            <td>
                              {
                                agentDetails.ownershipHistory[
                                  agentDetails.ownershipHistory.length - 1
                                ].transactionHash
                              }
                            </td>
                          </tr>
                          <tr>
                            <td>Timestamp:</td>
                            <td>
                              {
                                agentDetails.ownershipHistory[
                                  agentDetails.ownershipHistory.length - 1
                                ].timestamp
                              }
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>
              ) : selectedSection == 2 ? (
                <section className={styles.section_two}>
                  <MarkdownPreview
                    wrapperElement={{ "data-color-mode": "light" }}
                    source={agentDetails.documentation}
                    style={{
                      padding: "15px",
                      marginTop: "10px",
                      borderRadius: "10px",
                      borderBottomLeftRadius: "0px",
                    }}
                  />
                </section>
              ) : selectedSection == 3 ? (
                <section className={styles.section_three}>
                  <h4>Buy Credits</h4>
                  <p className={styles.credits_info}>
                    The amount of credit is equal to the number of request you
                    can made with that credit
                  </p>
                  <div className={styles.credits_options}>
                    <div
                      onClick={() => {
                        setCustomValue(false);
                        setCredits(100);
                      }}
                      className={`${styles.credit_box} ${
                        credits == 100 &&
                        !customValue &&
                        styles.selected_credit_plan
                      }`}
                    >
                      <h5>CREDITS</h5>
                      <span>100</span>
                    </div>

                    <div
                      onClick={() => {
                        setCustomValue(false);
                        setCredits(1000);
                      }}
                      className={`${styles.credit_box} ${
                        credits == 1000 &&
                        !customValue &&
                        styles.selected_credit_plan
                      }`}
                    >
                      <h5>CREDITS</h5>
                      <span>1000</span>
                    </div>

                    <div
                      onClick={() => {
                        setCustomValue(false);
                        setCredits(2000);
                      }}
                      className={`${styles.credit_box} ${
                        credits == 2000 &&
                        !customValue &&
                        styles.selected_credit_plan
                      }`}
                    >
                      <h5>CREDITS</h5>
                      <span>2000</span>
                    </div>

                    <div
                      onClick={() => {
                        setCustomValue(false);
                        setCredits(5000);
                      }}
                      className={`${styles.credit_box} ${
                        credits == 5000 &&
                        !customValue &&
                        styles.selected_credit_plan
                      }`}
                    >
                      <h5>CREDITS</h5>
                      <span>5000</span>
                    </div>

                    <div
                      className={`${styles.credit_box} ${
                        customValue && styles.selected_credit_plan
                      }`}
                      onClick={() => setCustomValue(!customValue)}
                    >
                      <h5>CREDITS</h5>
                      <span>
                        {customValue ? (
                          <Input
                            placeholder="Enter Credit Amount"
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) =>
                              setCredits(parseInt(e.target.value))
                            }
                            type="number"
                            max={10000}
                            min={1}
                            defaultValue={10}
                            step={1}
                          />
                        ) : (
                          "Custom"
                        )}
                      </span>
                    </div>
                  </div>
                </section>
              ) : null}
              {selectedSection != 3 ? (
                <section className={styles.section_four}>
                  <h4>Try API</h4>
                  <div className={styles.section_four_header}>
                    <DropDown
                      changeDefaultValue={setSelectedLanguage}
                      defaultValue={selectedLanguage}
                      valuesList={["Javascript", "Python"]}
                    />
                    <Button className={styles.tryAgent} onClick={tryAgent}>Send Request</Button>
                  </div>

                  <div className={styles.code_highlighter}>
                    <h4>Request Code</h4>
                    <SyntaxHighlighter
                      customStyle={{ fontSize: "14px" }}
                      language={selectedLanguage.toLowerCase()}
                      style={docco}
                    >
                      {templateCode[`${selectedLanguage.toLowerCase()}`]}
                    </SyntaxHighlighter>
                  </div>

                  <div className={styles.code_highlighter}>
                    <h4>Requeset Body</h4>
                    <textarea
                      value={requestBody}
                      className={styles.requestBody}
                      onChange={(e) => setRequestBody(e.target.value)}
                    ></textarea>
                  </div>

                  <div className={styles.code_highlighter}>
                    <h4>Expected Response</h4>
                    <SyntaxHighlighter
                      customStyle={{ fontSize: "14px" }}
                      language="javascript"
                      style={docco}
                    >
                      {tryAgentResponse?.length == 0
                        ? "// Response will appear here"
                        : JSON.stringify(tryAgentResponse)}
                    </SyntaxHighlighter>
                  </div>
                </section>
              ) : (
                <PaymentBill
                  type="credit"
                  width="30%"
                  func={buyCredits}
                  agent={agentDetails}
                  creditAmount={credits}
                />
              )}
            </div>
          </Page>
        </div>
      )}
    </>
  );
};

export default ViewAgent;
