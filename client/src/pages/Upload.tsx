import { FC, useEffect, useState } from "react";
import Page from "../components/Page";
import Input from "../components/ui/Input";
import styles from "../styles/pages/Upload.module.css";
import Button from "../components/ui/Button";
import CheckBox from "../components/ui/CheckBox";
import DropDown from "../components/ui/DropDown";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { useAppContext } from "../context/contextAPI";
import { useNavigate } from "react-router-dom";
import MDEditor from "@uiw/react-md-editor";
import Notification from "../utils/notification";
import { AiOutlineClose } from "react-icons/ai";
import Navbar from "../layouts/Navbar";

interface UploadProps {}

const Upload: FC<UploadProps> = ({}) => {
  const { loggedInUser, setIsProcessing, setProcessingText } = useAppContext();
  const navigate = useNavigate();

  const [markdownText, setMarkdownText] = useState<string>(``);
  const [formSection, setFormSection] = useState<number>(0);

  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [agentPurpose, setAgentPurpose] = useState<string>("");
  const [deployedURL, setDeployedURL] = useState<string>("");
  const [agentName, setAgentName] = useState<string>("");

  const [agentPlanType, setAgentPlanType] = useState<string>("Paid");
  const [usageLicense, setUsageLicense] = useState<string>("Commercial Use");
  const [agentStatus, setAgentStatus] = useState<string>("Available");
  const [showPreview, setShowPreview] = useState<boolean>(false);

  const [tags, setTags] = useState<any[]>([]);
  const [trainedOn, setTrainedOn] = useState<any[]>([]);
  const [confirmSubmission, setConfirmSubmission] = useState<boolean>(false);

  const [isForSale, setIsForSale] = useState<boolean>(false);
  const [requestBody, setRequestBody] = useState<any>({
    prompt: "Hello world",
    maxOutputLength: 1000,
  });
  const [requestMethod, setRequestMethod] = useState<string>("POST");

  const [agentSalePrice, setAgentSalePrice] = useState<number>(0);
  const [creditCostPerReq, setCreditCostPerReq] = useState<number>(1);
  const [costPerCredit, setCostPerCredit] = useState<number>(0.001);

  const [tagTxt, setTagTxt] = useState<string>("");
  const [trainedOnTxt, setTrainedOnTxt] = useState<string>("");
  const [agentIcon,setAgentIcon] = useState<string>("")

  const createAgent = async () => {
    setIsProcessing(true);
    setProcessingText("Uploading the Agent...");
    try {
      const data = {
        name: agentName,
        description: description,
        category: category,
        mintOnBlockchain: true,
        planType: agentPlanType,
        owner: loggedInUser?.walletAddress,
        creator: loggedInUser?.walletAddress,
        purpose: agentPurpose,
        trainedOn: trainedOn,
        tags: tags,
        status: agentStatus == "Available" ? 1 : 0,
        usageLicense: usageLicense,
        isForSale: isForSale,
        salePrice: agentSalePrice,
        documentation: markdownText,
        deployedAPI: deployedURL,
        requestMethod,
        requestBody: requestBody,
        rentingDetails: {
          costPerCredit: costPerCredit,
          creditCostPerReq: creditCostPerReq,
        },
      };

      const upload = await fetch(
        `${import.meta.env.VITE_API_URL}/wallets/mint`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agentData: data,
            recipient: loggedInUser?.walletAddress,
            agentIcon:agentIcon,
          }),
          credentials: "include",
        }
      );
      const response = await upload.json();
      if (upload.ok) {
        Notification.success("New agent created successfully");
      }
    } catch (err: any) {
      Notification.error(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  function convertToBase64(e:any) {
  
    let file = e.files[0];
    return new Promise((resolve, reject) => {
      const reader:any = new FileReader();
      
      reader.readAsDataURL(file); 
  
      reader.onload = () => {
        resolve(reader.result)
        setAgentIcon(reader.result)
        console.log(reader.result)
      };
      
      reader.onerror = (error:any) => reject(error);
    });
  }

  return (
    <Page width="fit">
      <div className={styles.upload_page}>
        <Navbar btn={false} />
        <h3 style={{marginTop:"20px"}}>Upload Agent</h3>
        <form
          className={`${styles.form} ${
            formSection == 0 ? styles.sixty : styles.full
          }`}
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && formSection == 0) {
              e.preventDefault();
            }
          }}
        >
          {formSection == 0 ? (
            <>
              <section className={styles.form_section}>
                <h3>✨ Agent Information</h3>
                <div className={styles.input_field}>
                  <span>Enter Customize Agent Icon</span>
                  <Input
                    placeholder=""
                    onChange={(e)=> convertToBase64(e.target)}
                    type="file"
                  />
                </div>

                <div className={styles.input_field}>
                  <span>Enter Agent Name</span>
                  <Input
                    placeholder=""
                    onChange={(e) => setAgentName(e.target.value)}
                    value={agentName}
                  />
                </div>

                <div className={styles.input_field}>
                  <span>Enter Agent Description</span>
                  <Input
                    placeholder=""
                    onChange={(e) => setDescription(e.target.value)}
                    value={description}
                  />
                </div>

                <div className={styles.input_field}>
                  <span>
                    Enter Agent Category (eg:- Booking, Chatboat, etc.)
                  </span>
                  <Input
                    placeholder=""
                    onChange={(e) => setCategory(e.target.value)}
                    value={category}
                  />
                </div>

                <div className={styles.input_field}>
                  <span>
                    Enter Agent Purpose (eg:- Booking Tickets, Automation, etc.)
                  </span>
                  <Input
                    placeholder=""
                    onChange={(e) => setAgentPurpose(e.target.value)}
                    value={agentPurpose}
                  />
                </div>

                <div className={styles.input_field}>
                  <span>Enter Agent Deployed URL (https)</span>
                  <Input
                    placeholder=""
                    onChange={(e) => setDeployedURL(e.target.value)}
                    value={deployedURL}
                  />
                </div>

                <div
                  className={styles.input_field}
                  style={{ marginTop: "10px" }}
                >
                  <span style={{ marginBottom: "7px" }}>
                    Select Agent Request Method
                  </span>
                  <DropDown
                    changeDefaultValue={setRequestMethod}
                    valuesList={["POST", "PUT"]}
                    defaultValue={requestMethod}
                  />
                </div>

                <div
                  className={styles.input_field}
                  style={{ marginTop: "20px" }}
                >
                  <span>
                    Specify the Request Body Format (example structure expected
                    when calling your API) [JSON]
                  </span>
                  <textarea onChange={(e) => setRequestBody(e.target.value)}>
                    {JSON.stringify(requestBody)}
                  </textarea>
                </div>

                <div className={styles.input_field}>
                  <span>Agent Trained On (include links, topics, etc)</span>
                  <Input
                    value={trainedOnTxt}
                    onChange={(e) => setTrainedOnTxt(e.target.value)}
                    placeholder=""
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        setTrainedOn((oldData) => [
                          ...oldData,
                          //@ts-ignore
                          e.target?.value,
                        ]);
                        setTrainedOnTxt("");
                      }
                    }}
                  />
                  <div className={styles.tags_tags_tags}>
                    {trainedOn.map((data) => {
                      return (
                        <span>
                          <AiOutlineClose
                            onClick={() =>
                              setTrainedOn((oldData) =>
                                oldData.filter((tag) => tag !== data)
                              )
                            }
                          />{" "}
                          {data}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className={styles.input_field}>
                  <span>Add Agent Tags</span>
                  <Input
                    value={tagTxt}
                    onChange={(e) => setTagTxt(e.target.value)}
                    placeholder=""
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        //@ts-ignore
                        setTags((oldData) => [...oldData, e.target?.value]);
                        setTagTxt("");
                      }
                    }}
                  />
                  <div className={styles.tags_tags_tags}>
                    {tags.map((data) => {
                      return (
                        <span>
                          <AiOutlineClose
                            onClick={() =>
                              setTags((oldData) =>
                                oldData.filter((tag) => tag !== data)
                              )
                            }
                          />{" "}
                          {data}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div
                  className={styles.input_field}
                  style={{ marginTop: "10px" }}
                >
                  <span style={{ marginBottom: "7px" }}>
                    Select Agent Usage License
                  </span>
                  <DropDown
                    changeDefaultValue={setUsageLicense}
                    valuesList={["Commercial Use", "Developement Use"]}
                    defaultValue={usageLicense}
                  />
                </div>

                <div
                  className={styles.input_field}
                  style={{ marginTop: "10px" }}
                >
                  <span style={{ marginBottom: "7px" }}>
                    Select Agent Status
                  </span>
                  <DropDown
                    changeDefaultValue={setAgentStatus}
                    valuesList={["Available", "UnAvailable"]}
                    defaultValue={agentStatus}
                  />
                </div>

                <div
                  className={styles.input_field}
                  style={{ marginTop: "10px" }}
                >
                  <span style={{ marginBottom: "7px" }}>
                    Select Agent Plan Type
                  </span>
                  <DropDown
                    changeDefaultValue={setAgentPlanType}
                    valuesList={["Paid", "Free"]}
                    defaultValue={agentPlanType}
                  />
                </div>

                <div className={styles.input_field}>
                  <CheckBox
                    description={
                      "By checking it, you will be able to sell your agents as NFTs"
                    }
                    changeCheckBoxStatus={setIsForSale}
                    checkBoxStatus={isForSale}
                    text="Sell Agent As NFT"
                  />
                </div>

                {isForSale && (
                  <div className={styles.input_field}>
                    <span>Enter Agent Selling Price ($SEI Token QTY)</span>
                    <Input
                      onChange={(e) =>
                        setAgentSalePrice(parseInt(e.target.value))
                      }
                      placeholder=""
                      type="number"
                      min={1}
                      max={1000}
                      step={1}
                      defaultValue={5}
                    />
                  </div>
                )}
              </section>

              <section className={styles.form_section}>
                <h3>🐱‍🏍 Owner Information</h3>
                <div className={styles.input_field}>
                  <span>Ower Username</span>
                  <Input placeholder="" value={"aayushsingh7"} />
                </div>

                <div className={styles.input_field}>
                  <span>Owner Wallet Address</span>
                  <Input placeholder="" value={loggedInUser?.walletAddress} />
                </div>

                <div className={styles.input_field}>
                  <span>Creator Wallet Address</span>
                  <Input placeholder="" value={loggedInUser?.walletAddress} />
                </div>
              </section>

              <section className={styles.form_section}>
                <h3>Renting Details</h3>
                <div className={styles.input_field}>
                  <span>
                    Cost Per Credit (how many sei is reqiured to buy 1 credit)
                  </span>
                  <Input
                    //  value={costPerCredit}
                    onChange={(e) =>
                      setCostPerCredit(parseFloat(e.target.value))
                    }
                    type="number"
                    min={0.001}
                    max={0.08}
                    defaultValue={0.001}
                    step={0.001}
                  />
                </div>

                <div className={styles.input_field}>
                  <span>
                    Credit Post Per Request (credits to charge per request)
                  </span>
                  <Input
                    // value={creditCostPerReq}
                    onChange={(e) =>
                      setCreditCostPerReq(parseFloat(e.target.value))
                    }
                    type="number"
                    min={0.1}
                    max={10}
                    step={0.1}
                    defaultValue={1}
                  />
                </div>
              </section>
            </>
          ) : (
            <section className={styles.form_section}>
              <h3>
                <span>🐱‍🏍 Add a Detailed Documentation (Markdown)</span>{" "}
                <Button onClick={() => setShowPreview(!showPreview)}>
                  {showPreview ? "Hide Preview" : "Show Preview"}
                </Button>
              </h3>
              <div
                data-color-mode="light"
                className={styles.markdown_container}
              >
                {showPreview ? (
                  <div className={styles.preview}>
                    <MarkdownPreview
                      style={{ padding: "20px" }}
                      wrapperElement={{ "data-color-mode": "light" }}
                      source={markdownText}
                    />
                  </div>
                ) : (
                  <textarea
                  value={markdownText}
                    onChange={(e) => setMarkdownText(e.target.value)}
                  ></textarea>
                )}
              </div>
            </section>
          )}
          <div>
            {formSection == 1 && (
              <CheckBox
                changeCheckBoxStatus={setConfirmSubmission}
                checkBoxStatus={confirmSubmission}
                text="I confirm that all the data entered above are true & ethical"
              />
            )}
            {formSection == 0 ? (
              <Button
                className={styles.nor_button}
                onClick={() => setFormSection(1)}
              >
                Next
              </Button>
            ) : (
              <>
                <Button
                  className={styles.nor_button}
                  onClick={() => setFormSection(0)}
                >
                  Prev
                </Button>{" "}
                {confirmSubmission && (
                  <Button
                    className={styles.main_button}
                    onClick={createAgent}
                    disabled={!confirmSubmission}
                  >
                    Submit for Review
                  </Button>
                )}
              </>
            )}
          </div>
        </form>
      </div>
    </Page>
  );
};

export default Upload;
