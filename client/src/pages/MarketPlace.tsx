import { FC, useEffect, useState } from "react";
import Page from "../components/Page";
import Input from "../components/ui/Input";
import styles from "../styles/pages/MarketPlace.module.css";
import AgentBox from "../components/AgentBox";
import { useLocation, useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import NotFound from "../components/NotFound";
import Notification from "../utils/notification";
import { AiOutlineMenu } from "react-icons/ai";
import Navbar from "../layouts/Navbar";

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
  const [loading,setLoading] = useState<boolean>(false)

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/agents`);
        const data = await response.json();
        setAgents(data.data);
      } catch (err) {
       Notification.error("Oops! something went wrong while fetching agents")
      }
    };

    fetchAgents();
  }, []);

  useEffect(() => {
    const getSearchResults = async () => {
      try {
        if (searchQuery === "") navigate("/marketplace");
        setLoading(true)
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/agents/search?query=${searchQuery}`
        );
        const data = await res.json();
        setSearchData(data.data);
      } catch (err) {
        Notification.error("Oops! something went wrong while fetching search results")
        return null;
      }
      setLoading(false)
    };
    getSearchResults();
  }, [searchQuery]);

  return (
    <Page width="fit">
      <Navbar btn={false}/>
      <Input
        onKeyDown={(e) =>
          //@ts-ignore
          e.key == "Enter" && navigate(`/marketplace?search=${e.target.value}`)
        }
        placeholder="Search Agents (eg: Booking agents, Trading agents, etc..)"
      />
      {loading ? <Loading/> : searchQuery.length > 0 ? (
        searchData?.length <= 0 ?<NotFound text="Nothing Found 👀"/> : (
          <section className={styles.agents_container}>
            {searchData?.map((agent) => {
              return <AgentBox data={agent} type="normal" allowBorder={true} />;
            })}
          </section>
        )
      ) : (
        <section className={styles.agents_container}>
          {agents.map((agent) => {
            return <AgentBox data={agent} type="normal" allowBorder={true} />;
          })}
        </section>
      )}
    </Page>
  );
};

export default MarketPlace;
