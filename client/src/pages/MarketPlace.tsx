import { FC, useState } from "react";
import Page from "../components/Page";
import Input from "../components/ui/Input";
import styles from "../styles/pages/MarketPlace.module.css";
import AgentBox from "../components/AgentBox";
import { useLocation, useNavigate } from "react-router-dom";
import searchAgents from "../utils/searchAgents";

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

interface MarketPlaceProps {}

const MarketPlace: FC<MarketPlaceProps> = ({}) => {
const navigate = useNavigate()
  const [searchData, setSearchData] = useState<any>([]);
  const query = useQuery();
  const searchQuery = query.get("search") || "";


  return (
    <Page>
      <Input
        onKeyDown={(e) => setSearchData(searchAgents("input",navigate, e))}
        placeholder="Search Agents (eg: Booking agents, Trading agents, etc..)"
      />
      {searchData.length > 0 ? (
        <section className={styles.agents_container}>
          <AgentBox data={{}} type="normal" allowBorder={true} />
          <AgentBox data={{}} type="normal" allowBorder={true} />
          <AgentBox data={{}} type="normal" allowBorder={true} />
          <AgentBox data={{}} type="normal" allowBorder={true} />
        </section>
      ) : (
        <section className={styles.agents_container}>
          <AgentBox data={{}} type="normal" allowBorder={true} />
          <AgentBox data={{}} type="normal" allowBorder={true} />
          <AgentBox data={{}} type="normal" allowBorder={true} />
          <AgentBox data={{}} type="normal" allowBorder={true} />
        </section>
      )}
    </Page>
  );
};

export default MarketPlace;
