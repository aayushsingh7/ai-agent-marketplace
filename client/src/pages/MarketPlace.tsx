import { FC } from "react";
import Page from "../components/Page";
import Input from "../components/ui/Input";
import styles from "../styles/pages/MarketPlace.module.css"
import AgentBox from "../components/AgentBox";

interface MarketPlaceProps { }

const MarketPlace: FC<MarketPlaceProps> = ({ }) => {
  return (
     <Page>
        <Input placeholder="Search Agents (eg: Booking agents, Trading agents, etc..)"/>
        <section className={styles.agents_container}>
           <AgentBox/>
           <AgentBox/>
           <AgentBox/>
           <AgentBox/>
           <AgentBox/>
           <AgentBox/>
           <AgentBox/>
           <AgentBox/>
           <AgentBox/>
        </section>
     </Page>
  );
};

export default MarketPlace;