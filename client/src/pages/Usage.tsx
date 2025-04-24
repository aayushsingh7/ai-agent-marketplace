import { FC, useEffect, useState } from "react";
import Page from "../components/Page";
import styles from "../styles/pages/Usage.module.css";
import AgentBox from "../components/AgentBox";
import AreaChart from "../components/ui/charts/AreaChart";
import { useNavigate, useParams } from "react-router-dom";
import { useAppContext } from "../context/contextAPI";
import Notification from "../utils/notification";

interface UsageProps {}

const Usage: FC<UsageProps> = ({}) => {
  const { agentID } = useParams();
  const { loggedInUser } = useAppContext();
  const [userCredit, setUserCredit] = useState<any>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loggedInUser?._id) navigate("/auth");
    const fetchUserCredit = async () => {
      if (!loggedInUser?._id) return;
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/users/${
            loggedInUser?._id
          }/agents/${agentID}/user-credit`,
          {
            credentials: "include",
          }
        );
        const credit = await response.json();
        setUserCredit(credit.data);
      } catch (err) {
        Notification.error(
          "Oops! something went wrong while fetching user credit"
        );
      }
    };
    fetchUserCredit();
  }, [agentID]);

  return (
    <Page width="100%">
      <div className={styles.usage_page}>
        <h3>Agent Usage</h3>

        <section className={styles.credits_overview}>
          <div className={styles.credit_box}>
            <h5>API CALLS REMAINING</h5>
            <span>
              {Math.floor(
                userCredit?.totalCredits / userCredit?.creditsCostPerRequest
              )}
            </span>
          </div>

          <div className={styles.credit_box}>
            <h5>CREDITS REMAINING</h5>
            <span>{userCredit?.totalCredits}</span>
          </div>

          <div className={styles.credit_box}>
            <h5>CREDITS USED</h5>
            <span>{userCredit?.creditsUsed}</span>
          </div>
        </section>

        {/* <AreaChart /> */}

        <section style={{ marginTop: "60px" }}>
          <h4 style={{ fontSize: "0.7rem" }}>Transaction History</h4>
          {userCredit?.history.map((history:any) => {
            return (
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
                    <td>{history?.transactionHash}</td>
                  </tr>
                  <tr>
                    <td>Transaction Date:</td>
                    <td>{history?.timestamp}</td>
                  </tr>
                  <tr>
                    <td>Transaction Type:</td>
                    <td>{history?.type}</td>
                  </tr>
                  <tr>
                    <td>Credits Bought:</td>
                    <td>{history?.totalCreditPurchased}</td>
                  </tr>
                  <tr>
                    <td>Total SEI Spent:</td>
                    <td>{history?.amount} SEI</td>
                  </tr>
                </tbody>
              </table>
            );
          })}
        </section>
      </div>
    </Page>
  );
};

export default Usage;
