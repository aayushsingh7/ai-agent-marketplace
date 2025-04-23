import { FC, useEffect, useState } from "react";
import Page from "../components/Page";
import styles from "../styles/pages/Subscription.module.css";
import Input from "../components/ui/Input";
import AgentBox from "../components/AgentBox";
import { useAppContext } from "../context/contextAPI";
import { useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import NotFound from "../components/NotFound";
import Notification from "../utils/notification";

interface SubscriptionProps {}

const Subscription: FC<SubscriptionProps> = ({}) => {
  const { loggedInUser } = useAppContext();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);

  const fetchSubscriptions = async () => {
    if (!loggedInUser?._id) return;
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/users/${
          loggedInUser._id
        }/subscriptions`,
        { credentials: "include" }
      );
      const data = await response.json();
      setSubscriptions(data.data);
    } catch (err) {
      Notification.error("Oops! somthing went wrong while fetching subscriptions")
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [loggedInUser]);

  return (
    <Page>
      <div className={styles.subs_page}>
        <h3 style={{ marginBottom: "30px" }}>Your Subscriptions</h3>
        <Input placeholder="Search Agent" />
        {loading ? (
          <Loading />
        ) : subscriptions.length === 0 ? (
          <NotFound text="Nothing Found, Subscribe Any Agent To View" />
        ) : (
          <section className={styles.agents_container}>
            {subscriptions.map((data) => (
              <AgentBox
                key={data?.agent?._id}
                data={data.agent}
                allowBorder={true}
                type="subs"
              />
            ))}
          </section>
        )}
      </div>
    </Page>
  );
};

export default Subscription;
