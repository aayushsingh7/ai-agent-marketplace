import { FC } from "react";
import Page from "../components/Page";
import styles from "../styles/pages/Usage.module.css";
import AgentBox from "../components/AgentBox";
import AreaChart from "../components/ui/charts/AreaChart";

interface UsageProps {}

const Usage: FC<UsageProps> = ({}) => {
  return (
    <Page>
      <div className={styles.usage_page}>
        <h3>Agent Usage</h3>

        <section className={styles.credits_overview}>
          <div className={styles.credit_box}>
            <h5>API CALLS REMAINING</h5>
            <span>490</span>
          </div>

          <div className={styles.credit_box}>
            <h5>CREDITS REMAINING</h5>
            <span>700</span>
          </div>

          <div className={styles.credit_box}>
            <h5>CREDITS USED</h5>
            <span>300</span>
          </div>
        </section>

        <AreaChart />

        <section style={{ marginTop: "60px" }}>
          <h4 style={{ fontSize: "0.7rem" }}>Transaction History</h4>
          <table className={styles.usage_record}>
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
                <td>0x71b6d5c1234e9fa8c3d09876a1efab321f5678bc</td>
              </tr>
              <tr>
                <td>Transaction Date:</td>
                <td>2025-04-10</td>
              </tr>
              <tr>
                <td>Transaction Type:</td>
                <td>Added</td>
              </tr>
              <tr>
                <td>Amount :</td>
                <td>5 SEI</td>
              </tr>
              <tr>
                <td>Reason:</td>
                <td>Purchased Credits</td>
              </tr>
              <tr>
                <td>Gas Fee:</td>
                <td>0.0021 SEI</td>
              </tr>
            </tbody>
          </table>
          <table className={styles.usage_record}>
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
                <td>0x71b6d5c1234e9fa8c3d09876a1efab321f5678bc</td>
              </tr>
              <tr>
                <td>Transaction Date:</td>
                <td>2025-04-10</td>
              </tr>
              <tr>
                <td>Transaction Type:</td>
                <td>Added</td>
              </tr>
              <tr>
                <td>Amount :</td>
                <td>5 SEI</td>
              </tr>
              <tr>
                <td>Reason:</td>
                <td>Purchased Credits</td>
              </tr>
              <tr>
                <td>Gas Fee:</td>
                <td>0.0021 SEI</td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>
    </Page>
  );
};

export default Usage;
