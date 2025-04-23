import { FC, useEffect, useState } from "react";
import Notification from "../utils/notification";
import Page from "../components/Page";
import styles from "../styles/pages/Subscription.module.css"
import Loading from "../components/Loading";
import NotFound from "../components/NotFound";
import Input from "../components/ui/Input";
import AgentBox from "../components/AgentBox";
import { useAppContext } from "../context/contextAPI";
import { useNavigate } from "react-router-dom";

interface MyNFTsProps { }

const MyNFTs: FC<MyNFTsProps> = ({ }) => {
  const {loggedInUser} = useAppContext();
  const [nfts,setNfts] = useState<any[]>([])
  const [loading,setLoading] = useState<boolean>(false)
  const navigate = useNavigate();

  useEffect(()=> {
  const fetchNFTs = async()=> {
    if(!loggedInUser?._id) navigate("/auth")
      try {
       setLoading(true)
    const response = await fetch(`${import.meta.env.VITE_API_URL}/agents/nfts`,{credentials:"include"})
    const nftsData = await response.json()
    setNfts(nftsData.data)
   } catch (err:any) {
    Notification.error(err.message)
   }
   setLoading(false)
  }
  fetchNFTs();
  },[])
  return (
    <Page>
<div className={styles.subs_page}>
        <h3 style={{ marginBottom: "30px" }}>Your Subscriptions</h3>
        <Input placeholder="Search Agent" onKeyDown={(e) =>
                e.key == "Enter" &&
                //@ts-ignore
                navigate(`/marketplace?search=${e.target.value}`)
              }/>
        {loading ? (
          <Loading />
        ) : nfts.length === 0 ? (
          <NotFound text="Nothing Found, Subscribe Any Agent To View" />
        ) : (
          <section className={styles.agents_container}>
            {nfts.map((data) => (
              <AgentBox
                key={data._id}
                data={data}
                allowBorder={true}
                type="nft"
              />
            ))}
          </section>
        )}
      </div>
    </Page>
  );
};

export default MyNFTs;