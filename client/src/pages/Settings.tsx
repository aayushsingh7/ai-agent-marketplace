import { FC, useEffect, useState } from "react";
import Page from "../components/Page";
import styles from "../styles/pages/Settings.module.css";
import Input from "../components/ui/Input";
import { useAppContext } from "../context/contextAPI";
import Button from "../components/ui/Button";

interface SettingsProps {}

const Settings: FC<SettingsProps> = ({}) => {
  const {loggedInUser}= useAppContext()
  const [name,setName] = useState<string>()
  const [username,setUsername] = useState<string>()

  useEffect(()=> {
  setUsername(loggedInUser?.username)
  setName(loggedInUser?.name)
  },[loggedInUser])

  return (
    <Page>
      <div className={styles.settings}>
          <h3>Settings</h3>
        <section className={styles.form_section}>
          <div className={styles.input_field}>
            <span>Your Name</span>
            <Input
              placeholder="Enter Your Name"
              onChange={(e) => setName(e.target.value)}
              value={name}
            />
          </div>

          <div className={styles.input_field}>
            <span>Your Username</span>
            <Input
              placeholder="Enter Your Username"
              onChange={(e) => setUsername(e.target.value)}
              value={username}
            />
          </div>

          <div className={styles.input_field}>
            <span>Your Current Wallet</span>
            <Input
              readOnly
              value={loggedInUser?.walletAddress}
            />
            <p>To change this address, logout & use another wallet to sign in.</p>
          </div>

          <Button>Save Changes</Button>
        </section>
      </div>
    </Page>
  );
};

export default Settings;
