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
import Usage from "../layouts/Usage";
import Navbar from "../layouts/Navbar";
import { AiOutlineClose } from "react-icons/ai";
import Loading from "../components/Loading";
import formatDate from "../utils/formatDate";

interface ViewAgentProps {}

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ViewAgent: FC<ViewAgentProps> = ({}) => {
  const {
    loggedInUser,
    setSelectedAgent,
    setShowBuyAgent,
    setIsProcessing,
    setProcessingDescription,
    setProcessingText,
    setAgentUsage,
  } = useAppContext();
  const [selectedSection, setSelectedSection] = useState<number>(1);
  const query = useQuery();
  //@ts-ignore
  const tab = query.get("tab");

  const navigate = useNavigate();
  const [agentDetails, setAgentDetails] = useState<any>();
  const params = useParams();
  const [aiAgentResponesLoading, setAiAgentResponesLoading] =
    useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] =
    useState<string>("Javascript");
  const [credits, setCredits] = useState<number>(100);

  const [userCredit, setUserCredit] = useState<any>({});
  const [customValue, setCustomValue] = useState<boolean>(false);
  const [tryAgentAPI, setTryAgentAPI] = useState<boolean>(false);
  const [requestBody, setRequestBody] = useState();

  const templateCode: any = {
    javascript: `
      fetch("http://localhost:4000/api/v1/agents/use?agentID=${
        agentDetails?._id
      }", {
        method: "${agentDetails?.requestMethod}",
        headers: {
          "Content-Type": "application/json",
          "sei-agents-api-key": "${
            loggedInUser?._id == agentDetails?.owner?._id
              ? "owner-privilage-" + loggedInUser?._id
              : userCredit?.accessToken
              ? userCredit?.accessToken
              : "trail-use-" + loggedInUser?._id
          }"
        },
        credentials: "include",
        body: ${requestBody}
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
          loggedInUser?._id == agentDetails?.owner?._id
            ? "owner-privilage-" + loggedInUser?._id
            : userCredit?.accessToken
            ? userCredit?.accessToken
            : "trail-use-" + loggedInUser?._id
        }"
      }
  
      response = requests.${agentDetails?.requestMethod?.toLowerCase()}(
        url,
        headers=headers,
        ${
          agentDetails?.requestMethod?.toUpperCase() === "GET"
            ? ""
            : `data=${requestBody}`
        }
      )
  
      print(response.json())
    `,
  };

  useEffect(() => {
    fetchAgentDetails(params.agentID || "");
  }, []);

  useEffect(() => {
    setRequestBody(agentDetails?.requestBody);
  }, [agentDetails]);

  useEffect(() => {
    fetchUserCredit();
    //@ts-ignore
  }, [loggedInUser, agentDetails]);

  const fetchAgentDetails = async (agentID: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/agents/agent/${agentID}`
      );
      const data = await response.json();
      setAgentDetails(data.data);
      setSelectedAgent(data.data);
      setRequestBody(JSON.parse(data.data.requestBody));
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
      if (credit.data?._id) {
        setAgentUsage(true);
        //@ts-ignore
        if (tab == 4) setSelectedSection(4);
      } else {
        setAgentUsage(false);
      }
    } catch (err) {
      setAgentUsage(false);
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

      const loggedInUserWallet = loggedInUser?.walletAddress;
      const signerWallet = address;

      if (loggedInUserWallet.toLowerCase() != signerWallet.toLowerCase()) {
        Notification.error("Please use the Wallet you signed in with");
        Notification.info(
          "Maybe you have selected different account in metamask wallet"
        );
        return;
      }

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

      console.log(txData.data);
      setProcessingText("Executing The Transaction...");
      const tx = await contract[txData.data.method](...txData.data.params, {
        value: txData.data.value,
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
            creditAmount: credits * agentDetails?.rentingDetails?.costPerCredit,
            credits,
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
      setAiAgentResponesLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/agents/use?agentID=${
          agentDetails?._id
        }`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "sei-agents-api-key":
              loggedInUser?._id == agentDetails?.owner?._id
                ? "owner-privilage-" + loggedInUser?._id
                : userCredit?.accessToken
                ? userCredit?.accessToken
                : "trail-use-" + loggedInUser?._id,
          },
          body: requestBody,
          credentials: "include",
        }
      );
      const data = await response.json();
      setTryAgentResponse(data.data);
    } catch (err: any) {
      Notification.error(err.message);
    }
    setAiAgentResponesLoading(false);
  };
  const getAgentCreditCost = async () => {
    if (!agentDetails) return;
    const data = await fetch(
      `${import.meta.env.VITE_API_URL}/wallets/get-agent-credit-cost?tokenID=${
        agentDetails?.tokenId
      }`
    );
    const creditCost = await data.json();
    console.log(creditCost);
  };

  useEffect(() => {
    getAgentCreditCost();
  }, [agentDetails]);

  return (
    <>
      {agentDetails?._id ? (
        <div className="flex-page">
          <SideNav
            type="small"
            setTab={setSelectedSection}
            selectedTab={selectedSection}
          />
          <Page width="fit">
            <Navbar btn={false} />
            <Input
              placeholder="Search Agents (eg: Booking agents, Trading agents, etc..)"
              onKeyDown={(e) =>
                e.key == "Enter" &&
                //@ts-ignore
                navigate(`/marketplace?search=${e.target.value}`)
              }
            />
            <div className={styles.section_container}>
              {selectedSection == 1 ? (
                <section className={styles.section_one}>
                  <AgentBox
                    data={agentDetails}
                    type="normal"
                    allowBorder={false}
                  />

                  <div className={styles.agent_option}>
                    {agentDetails?.owner?.walletAddress !==
                      loggedInUser?.walletAddress && (
                      <>
                        {agentDetails.status === 1 && (
                          <Button onClick={() => setSelectedSection(3)}>
                            Rent Agent
                          </Button>
                        )}
                        {agentDetails.isForSale && (
                          <Button onClick={() => setShowBuyAgent(true)}>
                            Buy NFT
                          </Button>
                        )}
                      </>
                    )}

                    <Button
                      className={styles.try_api}
                      onClick={() => setTryAgentAPI(true)}
                    >
                      Try API
                    </Button>
                  </div>

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
                            <td>{agentDetails.isForSale ? "Yes" : "No"}</td>
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
                      <h4>Ownership History & Transactions</h4>
                      <div className={styles.ownership_transactions}>
                      {agentDetails.ownershipHistory.map((history:any)=> {
                        return (
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
                                 history.type
                                }
                              </td>
                            </tr>

                            <tr>
                              <td>Transaction Amount (SEI):</td>
                              <td>
                                {
                                 history?.amount || "0.00"
                                }
                              </td>
                            </tr>

                            <tr>
                              <td>Owner Address:</td>
                              <td>
                                {
                                 history.owner
                                }
                              </td>
                            </tr>
                            <tr>
                              <td>Transaction Hash:</td>
                              <td>
                                {
                                 history.transactionHash
                                }
                              </td>
                            </tr>
                            <tr>
                              <td>Timestamp:</td>
                              <td>
                                {
                                  formatDate(history.timestamp)
                                }
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        )
                      })}
                      </div>
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
                      onClick={() => {
                        setCustomValue(!customValue);
                        setCredits(10);
                      }}
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
                            max={5000}
                            min={5}
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
              ) : (
                <Usage userCredit={userCredit} />
              )}

              {selectedSection == 1 || selectedSection == 2 ? (
                <section
                  className={`${styles.section_four} ${
                    tryAgentAPI ? styles.show_request : styles.hide_request
                  }`}
                >
                  <h4>
                    <span>Try API</span>{" "}
                    <AiOutlineClose
                      style={{ fontSize: "25px" }}
                      onClick={() => setTryAgentAPI(false)}
                    />
                  </h4>
                  <div className={styles.section_four_header}>
                    <DropDown
                      changeDefaultValue={setSelectedLanguage}
                      defaultValue={selectedLanguage}
                      valuesList={["Javascript", "Python"]}
                    />
                    <Button className={styles.tryAgent} onClick={tryAgent}>
                      Send Request
                    </Button>
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
                      //@ts-ignore
                      onChange={(e) => setRequestBody(e.target.value)}
                    ></textarea>
                  </div>

                  <div className={styles.code_highlighter}>
                    <h4>Expected Response</h4>
                    <SyntaxHighlighter
                      customStyle={{ fontSize: "14px" }}
                      language="javascript"
                      style={docco}
                      wrapLines={true}
                      wrapLongLines={true}
                    >
                      {aiAgentResponesLoading
                        ? "// Fetching Response..."
                        : tryAgentResponse?.length == 0
                        ? "// Response will appear here"
                        : JSON.stringify(tryAgentResponse)}
                    </SyntaxHighlighter>
                  </div>
                </section>
              ) : selectedSection == 3 ? (
                <PaymentBill
                  type="credit"
                  width="30%"
                  func={buyCredits}
                  agent={agentDetails}
                  creditAmount={credits}
                />
              ) : null}
            </div>
          </Page>
        </div>
      ) : (
        <Loading />
      )}
    </>
  );
};

export default ViewAgent;
