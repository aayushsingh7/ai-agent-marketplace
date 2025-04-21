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

interface ViewAgentProps {}

const ViewAgent: FC<ViewAgentProps> = ({}) => {
  const { loggedInUser } = useAppContext();
  const [selectedSection, setSelectedSection] = useState<number>(1);
  const navigate = useNavigate();
  const [agentDetails, setAgentDetails] = useState<any>();
  const [agree, setAgree] = useState<boolean>(false);
  const params = useParams();
  const [selectedLanguage, setSelectedLanguage] =
    useState<string>("Javascript");
  const [fetchMethod, setFetchMethod] = useState<string>("Fetch");
  const [credits, setCredits] = useState<number>(100);

  const [userCredit, setUserCredit] = useState<any>({});
  const [customValue, setCustomValue] = useState<boolean>(false);

  const templateCode: any = {
    javascript: `
  fetch("http://localhost:4000/api/v1/agents/use?agentID=${agentDetails?._id}", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
     "sei-agents-api-key": "${userCredit?.accessToken}"
    },
    credentials: "include"
  })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error("Error:", error));
    `,

    java: `
  import java.io.*;
  import java.net.*;
  import java.util.*;
  
  public class FetchExample {
    public static void main(String[] args) throws Exception {
      URL url = new URL("https://tiral-api-ai-gent.com");
      HttpURLConnection con = (HttpURLConnection) url.openConnection();
      con.setRequestMethod("GET");
      con.setRequestProperty("Content-Type", "application/json");
      con.setRequestProperty("Authorization", "Bearer YOUR_TOKEN");
      con.setDoInput(true);
  
      BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));
      String inputLine;
      StringBuffer content = new StringBuffer();
      while ((inputLine = in.readLine()) != null) {
        content.append(inputLine);
      }
      in.close();
      con.disconnect();
  
      System.out.println(content.toString());
    }
  }
    `,

    python: `
  import requests
  
  url = "https://tiral-api-ai-gent.com"
  headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_TOKEN"
  }
  
  response = requests.get(url, headers=headers, cookies={"session": "your_session_id"})
  print(response.json())
    `,
  };

  const response: string = `
{
  "agentId": "ai-9283746",
  "name": "Nova",
  "model": "GPT-5.2",
  "version": "5.2.0-beta",
  "createdAt": "2025-03-15T10:25:43Z",
  "capabilities": {
    "languageUnderstanding": true,
    "multilingualSupport": ["en", "es", "fr", "de", "zh", "hi"],
    "imageProcessing": true,
    "codeGeneration": true,
    "emotionalRecognition": false
  },
  "settings": {
    "temperature": 0.7,
    "maxTokens": 2048,
    "responseDelay": "150ms",
    "safetyMode": "strict"
  },
  "status": {
    "online": true,
    "currentTasks": [
      {
        "taskId": "task-8891",
        "type": "summarization",
        "assignedAt": "2025-04-13T08:00:00Z"
      },
      {
        "taskId": "task-8892",
        "type": "codeReview",
        "assignedAt": "2025-04-13T08:15:00Z"
      }
    ]
  },
  "owner": {
    "name": "Aayush Singh",
    "email": "aayush@example.com",
    "organization": "NextWave AI Labs"
  }
}
`;

  useEffect(() => {
    console.log("fetched agent details", params.agentID);
    fetchAgentDetails(params.agentID || "");
    fetchUserCredit();
  }, []);

  const fetchAgentDetails = async (agentID: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/agents/agent/${agentID}`
      );
      const data = await response.json();
      setAgentDetails(data.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchUserCredit = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/users/${loggedInUser._id}/agents/${
          agentDetails._id
        }/user-credit`,{
          credentials:"include"
        }
      );
      const credit = await response.json();
      setUserCredit(credit.data);
    } catch (err) {
      console.error(err);
    }
  };

  const buyAgentNFT = async () => {
    try {
      const request = await fetch(
        `${import.meta.env.VITE_API_URL}/wallets/buy-nft`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agentID: "6804f5c541723a1a95aaed62",
            tokenID: "5",
          }),
          credentials: "include",
        }
      );
      const response = await request.json();
      console.log(response);
    } catch (err) {
      console.error(err);
    }
  };

  const buyCredits = async () => {
    try {
      const request = await fetch(
        `${import.meta.env.VITE_API_URL}/wallets/buy-credits`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tokenId: "3",
            creditAmount: credits,
            agentID: "6804f5c541723a1a95aaed62",
          }),
          credentials: "include",
        }
      );
      let response = await request.json();
      console.log(response);
    } catch (err) {
      console.log(err);
    }
  };

  const tryAgent = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/use?agentID=${agentDetails?._id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "sei-agents-api-key": userCredit.accessToken,
          },
          credentials: "include",
        }
      );
    } catch (err) {
      console.error(err);
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
          <Page>
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
                    <Button onClick={() => setSelectedSection(3)}>
                      Rent Agent
                    </Button>
                    <Button onClick={buyAgentNFT}>Buy NFT</Button>
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
                            <td>Agent Name:</td>
                            <td>{agentDetails.name}</td>
                          </tr>
                          <tr>
                            <td>Purpose:</td>
                            <td>{agentDetails.purpose}</td>
                          </tr>
                          <tr>
                            <td>Owner:</td>
                            <td>Maria Anders</td>
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
              ) : null}
              {selectedSection != 3 ? (
                <section className={styles.section_four}>
                  <h4>Try API</h4>
                  <div className={styles.section_four_header}>
                    <DropDown
                      changeDefaultValue={setSelectedLanguage}
                      defaultValue={selectedLanguage}
                      valuesList={["Javascript", "Java", "Python"]}
                    />
                    {/* <DropDown
                changeDefaultValue={setFetchMethod}
                defaultValue={fetchMethod}
                valuesList={["Fetch", "Axios"]}
              /> */}
                    <Button>Send Request</Button>
                  </div>

                  <div className={styles.code_highlighter}>
                    <h4>Request Code</h4>
                    <SyntaxHighlighter
                      customStyle={{ fontSize: "14px" }}
                      language="javascript"
                      style={docco}
                    >
                      {templateCode[`${selectedLanguage.toLowerCase()}`]}
                    </SyntaxHighlighter>
                  </div>

                  <div className={styles.code_highlighter}>
                    <h4>Expected Response</h4>
                    <SyntaxHighlighter
                      customStyle={{ fontSize: "14px" }}
                      language="javascript"
                      style={docco}
                    >
                      {response}
                    </SyntaxHighlighter>
                  </div>
                </section>
              ) : (
                <section className={`${styles.section_four} ${styles.payment}`}>
                  <div className={styles.payment_box}>
                    <h4>Payment Summary</h4>
                    <div className={styles.blocks}>
                      <p>
                        <span>Total Credits:</span> <strong>{credits}</strong>
                      </p>
                      <p>
                        <span>Cost Per Credit:</span>{" "}
                        <strong>
                          {agentDetails.rentingDetails.costPerCredit} SEI
                        </strong>
                      </p>
                    </div>
                    <div className={styles.blocks}>
                      <p>
                        <span>Blockchain:</span> <strong>$SEI</strong>
                      </p>
                    </div>
                    <div className={styles.blocks}>
                      <p>
                        <span>Total:</span>{" "}
                        <strong>
                          ${agentDetails.rentingDetails.costPerCredit * credits}
                        </strong>
                      </p>
                      <p>
                        <span>Gas Fee:</span> <strong>$0.00224 WSI</strong>
                      </p>
                    </div>
                    <div className={styles.blocks}>
                      <p>
                        <strong>GRAND TOTAL:</strong>{" "}
                        <strong>
                          $
                          {agentDetails.rentingDetails.costPerCredit * credits +
                            0.00224}
                        </strong>
                      </p>
                    </div>
                  </div>

                  <div>
                    <CheckBox
                      description={
                        "By checking it, you agree that the money will be deducted from your metamask wallet automatically"
                      }
                      changeCheckBoxStatus={setAgree}
                      checkBoxStatus={agree}
                      text="Confirm Payment"
                    />
                    <Button
                      onClick={buyCredits}
                      style={{
                        fontSize: "0.8rem",
                        padding: "15px 20px",
                        width: "100%",
                        color: "#ffffff",
                        background: "#b30000",
                        borderRadius: "5px",
                        marginTop: "10px",
                      }}
                    >
                      Proceed to Pay via MetaMask
                    </Button>
                  </div>
                </section>
              )}
            </div>
          </Page>
        </div>
      )}
    </>
  );
};

export default ViewAgent;
