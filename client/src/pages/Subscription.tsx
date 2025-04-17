import { FC } from "react";
import Page from "../components/Page";
import styles from "../styles/pages/Subscription.module.css";
import Input from "../components/ui/Input";
import AgentBox from "../components/AgentBox";

interface SubscriptionProps {}

const Subscription: FC<SubscriptionProps> = ({}) => {
  return (
    <Page>
      <div className={styles.subs_page}>
        <h3 style={{ marginBottom: "30px" }}>Your Subscriptions</h3>
        <Input placeholder="Search Agent" />
        <section className={styles.agents_container}>
          <AgentBox allowBorder={true} type={"subs"} />
          <AgentBox allowBorder={true} type={"subs"} />
          <AgentBox allowBorder={true} type={"subs"} />
          <AgentBox allowBorder={true} type={"subs"} />
        </section>
      </div>
    </Page>
  );
};

export default Subscription;
