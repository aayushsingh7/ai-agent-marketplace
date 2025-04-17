import { FC, useState } from "react";
import Page from "../components/Page";
import Input from "../components/ui/Input";
import styles from "../styles/pages/Upload.module.css";
import Button from "../components/ui/Button";
import CheckBox from "../components/ui/CheckBox";
import DropDown from "../components/ui/DropDown";
import MarkdownPreview from "@uiw/react-markdown-preview";

interface UploadProps {}

const Upload: FC<UploadProps> = ({}) => {
  const [mintAsNFT, setMintAsNFT] = useState<boolean>(false);

  const [agentPlanType, setAgentPlanType] = useState<string>("");

  const [markdownText, setMarkdownText] = useState<string>("");
  const [formSection, setFormSection] = useState<number>(0);

  const [confirmSubmission, setConfirmSubmission] = useState<boolean>(false)

  return (
    <Page>
      <div className={styles.upload_page}>
        <h3>Upload Agent</h3>
        <form
          className={`${styles.form} ${
            formSection == 0 ? styles.sixty : styles.full
          }`}
          onSubmit={(e) => e.preventDefault()}
        >
          {formSection == 0 ? (
            <>
              <section className={styles.form_section}>
                <h3>✨ Agent Information</h3>
                <div className={styles.input_field}>
                  <span>Enter Agent Name</span>
                  <Input placeholder="" />
                </div>

                <div className={styles.input_field}>
                  <span>
                    Enter Agent Name
                    <span
                      title="Required"
                      style={{ marginLeft: "2px", color: "#b30000" }}
                    >
                      *
                    </span>
                  </span>
                  <Input placeholder="" />
                </div>

                <div className={styles.input_field}>
                  <span>
                    Enter Agent Category (eg:- Booking, Chatboat, etc.)
                  </span>
                  <Input placeholder="" />
                </div>

                <div className={styles.input_field}>
                  <span>
                    Enter Agent Purpose (eg:- Booking Tickets, Automation, etc.)
                  </span>
                  <Input placeholder="" />
                </div>

                <div
                  className={styles.input_field}
                  style={{ marginTop: "10px" }}
                >
                  <span style={{ marginBottom: "7px" }}>
                    Select Agent Status
                  </span>
                  <DropDown
                    changeDefaultValue={setAgentPlanType}
                    valuesList={[
                      "Commercial Use",
                      "Developement Use",
                      "UnAvailable",
                    ]}
                    defaultValue="Commercial Use"
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
                    defaultValue="Paid"
                  />
                </div>

                <div className={styles.input_field}>
                  <CheckBox
                    description={
                      "By checking it, you will be able to sell your agents as NFTs"
                    }
                    changeCheckBoxStatus={setMintAsNFT}
                    checkBoxStatus={mintAsNFT}
                    text="Mint Agent as NFT"
                  />
                </div>
              </section>

              <section className={styles.form_section}>
                <h3>🐱‍🏍 Owner Information</h3>
                <div className={styles.input_field}>
                  <span>Ower Username</span>
                  <Input placeholder="" value={"aayushsingh7"} />
                </div>

                <div className={styles.input_field}>
                  <span>Owner Wallet Address</span>
                  <Input
                    placeholder=""
                    value={"sei19qfqe50993403320r0952039j"}
                  />
                </div>
              </section>

              <section className={styles.form_section}>
                <h3>Renting Details</h3>
                <div className={styles.input_field}>
                  <span>
                    Cost Per Credit (how many sei is reqiured to buy 1 credit)
                  </span>
                  <Input
                    type="number"
                    min={0.01}
                    max={0.1}
                    defaultValue={0.01}
                    step={0.01}
                  />
                </div>

                <div className={styles.input_field}>
                  <span>
                    Credit Post Per Request (credits to charge per request)
                  </span>
                  <Input
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
              <h3>🐱‍🏍 Add a Detailed Documentation (Markdown)</h3>
              <div
                data-color-mode="light"
                className={styles.markdown_container}
              >

                <textarea onChange={(e)=> setMarkdownText(e.target.value)}></textarea>
                <div className={styles.preview}>
                <MarkdownPreview
                style={{padding:"20px"}}
                wrapperElement={{ "data-color-mode": "light" }}
                source={markdownText}
                />
                </div>

              </div>

              {/* <MDEditor.Markdown source={value} style={{ whiteSpace: 'pre-wrap' }} /> */}
            </section>
          )}
          <div>
            {formSection == 1 &&  <CheckBox changeCheckBoxStatus={setConfirmSubmission} checkBoxStatus={confirmSubmission} text="I confirm that all the data entered above are true & ethical" />}
            {formSection == 0 ? (
              <Button onClick={() => setFormSection(1)}>Next</Button>
            ) : (
              <>
                <Button onClick={() => setFormSection(0)}>Prev</Button>{" "}
                <Button onClick={() => setFormSection(1)}>Submit for Review</Button>
              </>
            )}
          </div>
        </form>
      </div>
    </Page>
  );
};

export default Upload;
