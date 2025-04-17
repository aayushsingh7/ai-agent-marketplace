import { FC, useState } from "react";
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

interface ViewAgentProps {}

const ViewAgent: FC<ViewAgentProps> = ({}) => {
  const [selectedSection, setSelectedSection] = useState<number>(1);
  const [selectedLanguage, setSelectedLanguage] =
    useState<string>("Javascript");
  const [fetchMethod, setFetchMethod] = useState<string>("Fetch");

  const templateCode: any = {
    javascript: `
  fetch("https://tiral-api-ai-gent.com", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer YOUR_TOKEN"
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
  return (
    <div className="flex-page">
      <SideNav
        type="small"
        setTab={setSelectedSection}
        selectedTab={selectedSection}
      />
      <Page>
        <Input placeholder="Search Agents (eg: Booking agents, Trading agents, etc..)" />
        <div className={styles.section_container}>
          {selectedSection == 1 ? (
            <section className={styles.section_one}>
              <AgentBox type="normal" allowBorder={false} />

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
                        <td>VisionX-TradeBot</td>
                      </tr>
                      <tr>
                        <td>Purpose:</td>
                        <td>Real-time Stock Market Analysis</td>
                      </tr>
                      <tr>
                        <td>Owner:</td>
                        <td>Maria Anders</td>
                      </tr>
                      <tr>
                        <td>Trained On:</td>
                        <td>500M+ financial datasets</td>
                      </tr>
                      <tr>
                        <td>Current Status:</td>
                        <td>Available for Rent</td>
                      </tr>
                      <tr>
                        <td>Usage License:</td>
                        <td>Monthly, Commercial Use</td>
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
                        <td>Owner Wallet Address:</td>
                        <td>sei1q9af2d9kdn33k98s7ajl2jk3hj3l09d0el9c8v</td>
                      </tr>
                      <tr>
                        <td>Transaction Hash:</td>
                        <td>0x71b6d5c1234e9fa8c3d09876a1efab321f5678bc</td>
                      </tr>
                      <tr>
                        <td>Last Verified:</td>
                        <td>2025-04-10</td>
                      </tr>
                      <tr>
                        <td>Smart Contract:</td>
                        <td>AgentRentingContractV1</td>
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
                source={`
# VisionX-TradeBot
[Try it out now 🚀](https://chatverse-chat.netlify.app/)

---

## Features
- Real-time chat & notifications
- Change chat theme & background
- Create groups, assign/remove admins, add/remove users & block users
- Supports all kinds of file sharing via messaging
- Reply to & react to messages
- Add/remove messages to favorites

---

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 14 or higher)  
  Download and install from [Node.js official website](https://nodejs.org/).
- **Git** (for cloning the repository)  
  Download and install from [Git official website](https://git-scm.com/).

---

## Installation & Usage

To get started with the project, follow these steps:
`}
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
                The amount of credit is equal to the number of request you can
                made with that credit
              </p>
              <div className={styles.credits_options}>
                <div className={styles.credit_box}>
                  <h5>CREDITS</h5>
                  <span>100</span>
                </div>

                <div className={styles.credit_box}>
                  <h5>CREDITS</h5>
                  <span>1000</span>
                </div>

                <div className={styles.credit_box}>
                  <h5>CREDITS</h5>
                  <span>2000</span>
                </div>

                <div className={styles.credit_box}>
                  <h5>CREDITS</h5>
                  <span>5000</span>
                </div>

                <div className={styles.credit_box}>
                  <h5>CREDITS</h5>
                  <span>Custom</span>
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
                    <span>Total Credits:</span> <strong>1000</strong>
                  </p>
                  <p>
                    <span>Cost Per Credit:</span> <strong>0.002 SEI</strong>
                  </p>
                </div>
                <div className={styles.blocks}>
                  <p>
                    <span>Blockchain:</span> <strong>Sei</strong>
                  </p>
                </div>
                <div className={styles.blocks}>
                  <p>
                    <span>Total:</span> <strong>$10</strong>
                  </p>
                  <p>
                    <span>Gas Fee:</span> <strong>$5</strong>
                  </p>
                </div>
                <div className={styles.blocks}>
                  <p>
                    <strong>GRAND TOTAL:</strong> <strong>$15</strong>
                  </p>
                </div>
              </div>

              <Button>Open Wallet</Button>
            </section>
          )}
        </div>
      </Page>
    </div>
  );
};

export default ViewAgent;
