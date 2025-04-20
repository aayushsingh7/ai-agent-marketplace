import { FC, useEffect, useState } from "react";
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
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState([]);
  const query = useQuery();
  const searchQuery = query.get("search") || "";
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/agents`);
        const data = await response.json();
        setAgents(data.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchAgents();
  }, []);

  return (
    <Page>
      <Input
      // @ts-ignore
        onKeyDown={(e) => setSearchData(searchAgents("input", navigate, e))}
        placeholder="Search Agents (eg: Booking agents, Trading agents, etc..)"
      />
      {searchData.length > 0 ? (
        <section className={styles.agents_container}>
         {searchData.map((agent)=> {
          return  <AgentBox data={agent} type="normal" allowBorder={true} />
         })}
        </section>
      ) : (
        <section className={styles.agents_container}>
         {agents.map((agent)=> {
          return  <AgentBox data={agent} type="normal" allowBorder={true} />
         })}
        </section>
      )}
    </Page>
  );
};

export default MarketPlace;
