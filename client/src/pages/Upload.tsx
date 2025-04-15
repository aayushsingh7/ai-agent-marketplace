import { FC } from "react";
import Page from "../components/Page";
import Input from "../components/ui/Input";
import styles from "../styles/pages/Upload.module.css";
import Button from "../components/ui/Button";

interface UploadProps {}

const Upload: FC<UploadProps> = ({}) => {
  return (
    <Page>
      <div className={styles.upload_page}>
        <h3>Upload Agent</h3>
        <form className={styles.form} onSubmit={(e)=> e.preventDefault()}>
          <section className={styles.form_section}>
            <h3>✨ Agent Information</h3>
            <div className={styles.input_field}>
              <span>Enter Agent Name</span>
              <Input placeholder="" />
            </div>

            <div className={styles.input_field}>
              <span>Enter Agent Name</span>
              <Input placeholder="" />
            </div>

            <div className={styles.input_field}>
              <span>Enter Agent Name</span>
              <Input placeholder="" />
            </div>
          </section>

          <section className={styles.form_section}>
            <h3>🐱‍🏍 Owner Information</h3>
            <div className={styles.input_field}>
              <span>Enter Agent Name</span>
              <Input placeholder="" />
            </div>

            <div className={styles.input_field}>
              <span>Enter Agent Name</span>
              <Input placeholder="" />
            </div>

            <div className={styles.input_field}>
              <span>Enter Agent Name</span>
              <Input placeholder="" />
            </div>
          </section>

        <div>
        <p className={styles.button_container}>
            To ensure a fair and ethical platform, please upload your API for
            review.
          </p>

          <Button>Upload for Review</Button>
        </div>
        </form>
      </div>
    </Page>
  );
};

export default Upload;
