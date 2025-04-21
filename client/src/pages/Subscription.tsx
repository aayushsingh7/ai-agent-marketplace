import { FC, useEffect, useState } from "react";
import Page from "../components/Page";
import styles from "../styles/pages/Subscription.module.css";
import Input from "../components/ui/Input";
import AgentBox from "../components/AgentBox";
import { useAppContext } from "../context/contextAPI";
import { useNavigate } from "react-router-dom";

interface SubscriptionProps {}

const Subscription: FC<SubscriptionProps> = ({}) => {
   const {loggedInUser} = useAppContext()
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const navigate = useNavigate()

  const fetchSubscriptions = async () => {
   if(!loggedInUser?._id) return;
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/users/${loggedInUser._id}/subscriptions`,{credentials:"include"});
      const data = await response.json();
      setSubscriptions(data.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [loggedInUser]);

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
