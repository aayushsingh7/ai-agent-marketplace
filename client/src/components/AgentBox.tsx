import { FC } from "react";
import styles from "../styles/components/AgentBox.module.css";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { FaClock, FaStar } from "react-icons/fa";
import { BiSolidDollarCircle } from "react-icons/bi";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/contextAPI";

interface AgentBoxProps {
  allowBorder: boolean;
  type: "normal" | "subs" | "nft";
  data: any;
}

const AgentBox: FC<AgentBoxProps> = ({
  allowBorder,
  type = "normal",
  data,
}) => {
  const { setSelectedAgent, setEditNFT, loggedInUser } = useAppContext();
  const navigate = useNavigate();
  return (
    <figure
      onClick={() => navigate(`/marketplace/agents/${data._id}`)}
      className={`${styles.agent_box_main} ${
        allowBorder ? styles.border : " "
      }`}
    >
      {allowBorder && (
        <p title="Agent Category" className={styles.agent_type_tag}>
          {data.category}
        </p>
      )}

      {location.pathname.startsWith("/subscription") &&   <p title="Agent Category" className={styles.agent_type_tag} style={{marginLeft:"8px"}}>
          Subscribed
        </p>}

      {(loggedInUser?._id == data.owner || loggedInUser?.walletAddress == data?.owner?.walletAddress)&& (
        <p
          title="Agent Category"
          className={styles.agent_type_tag}
          style={{ marginLeft: location.pathname.startsWith("/marketplace/agents") ? "0px" : "8px" }}
        >
          Owned by You
        </p>
      )}
      <div className={styles.agent_box}>
        <div className={styles.image_section}>
          <div className={styles.agent_image}>
            <img
             src={data?.agentIcon || "https://res.cloudinary.com/dvk80x6fi/image/upload/w_1000,c_fill,ar_1:1,g_auto,r_max,bo_5px_solid_red,b_rgb:262c35/v1745587157/artificial-intelligence-silhouette-vector-icons-isolated-on-white-cyber-technologies-icon_cikjrz.jpg"}
              alt=""
            />
          </div>
        </div>
        <figcaption className={styles.agent_caption}>
          <h4>
            {data.name}
            <span>{data.verified && <RiVerifiedBadgeFill />}</span>
          </h4>
          <p className={allowBorder ? styles.wrap_pera : ""}>
            {data.description}
          </p>
          {type == "normal" ? (
            <>
              <div className={styles.tags_container}>
                <span
                  aria-label="Reviews"
                  title="Reviews out of 10"
                  className={styles.tag}
                >
                  <FaStar /> {data.ratings} ({data.totalRatedCount})
                </span>
                <span
                  className={styles.tag}
                  aria-label="Plan Type"
                  title="Plan Type"
                >
                  <BiSolidDollarCircle style={{ fontSize: "16px" }} />{" "}
                  {data.planType}
                </span>

                <span
                  className={styles.tag}
                  aria-label="Response Time (ms)"
                  title="Response Time (ms)"
                >
                {data.isForSale ? "For Sale" : "Not For Sale"}
                </span>
              </div>

              <span className={styles.total_used}>
                Created by <span>{data?.creator?.username}</span>
              </span>
            </>
          ) : (
            <>
              {type == "nft" ? (
                <p className={styles.see_usage} onClick={(e)=> {e.stopPropagation();setEditNFT(true);setSelectedAgent(data)}}>Edit NFT Details</p>
              ) : (
                <Link
                  onClick={(e) => e.stopPropagation()}
                  className={styles.see_usage}
                  to={`/marketplace/agents/${data._id}?tab=4`}
                >
                  View Usage Details
                </Link>
              )}
            </>
          )}
        </figcaption>
      </div>
    </figure>
  );
};

export default AgentBox;
