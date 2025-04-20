import { FC, useEffect, useState } from "react";
import Page from "../components/Page";
import styles from "../styles/pages/Subscription.module.css";
import Input from "../components/ui/Input";
import AgentBox from "../components/AgentBox";

interface SubscriptionProps {}

const Subscription: FC<SubscriptionProps> = ({}) => {
  let loggedInUser = { _id: "er9eif9iad9d" };
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/user/subscriptions?userID=${
          loggedInUser._id
        }`
      );
      const data = await response.json();
      setSubscriptions(data.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  return (
    <Page>
      <div className={styles.subs_page}>
        <h3 style={{ marginBottom: "30px" }}>Your Subscriptions</h3>
        <Input placeholder="Search Agent" />
        <section className={styles.agents_container}>
          {subscriptions.map((data) => {
            return <AgentBox data={data} allowBorder={true} type={"subs"} />;
          })}
        </section>
      </div>
    </Page>
  );
};

export default Subscription;
