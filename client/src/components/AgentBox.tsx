import { FC } from "react";
import styles from "../styles/components/AgentBox.module.css";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { FaClock, FaStar } from "react-icons/fa";
import { BiSolidDollarCircle } from "react-icons/bi";
import { Link, useNavigate } from "react-router-dom";

interface AgentBoxProps {
  allowBorder: boolean;
  type: "normal" | "subs";
  data:any;
}

const AgentBox: FC<AgentBoxProps> = ({ allowBorder, type = "normal",data }) => {
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
      <div className={styles.agent_box}>
        <div className={styles.image_section}>
          <div className={styles.agent_image}>
            <img
              src="https://cdn.britannica.com/47/246247-050-F1021DE9/AI-text-to-image-photo-robot-with-computer.jpg "
              alt=""
            />
          </div>
        </div>
        <figcaption className={styles.agent_caption}>
          <h4>
            {data.name}
            <span>
              {data.verified && <RiVerifiedBadgeFill />}
            </span>
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
                  aria-label="Response Time (ms)"
                  title="Response Time (ms)"
                >
                  <FaClock /> {data.responseTime} ms
                </span>
                <span
                  className={styles.tag}
                  aria-label="Plan Type"
                  title="Plan Type"
                >
                  <BiSolidDollarCircle style={{ fontSize: "16px" }} /> {data.planType}
                </span>
              </div>

              <span className={styles.total_used}>
                Created by <span>{data.owner.username}</span>
              </span>
            </>
          ) : (
            <>
              <Link
              onClick={(e)=> e.stopPropagation()}
                className={styles.see_usage}
                to={`/subscriptions/agents/${data._id}`}
              >
                View Usage Details
              </Link>
            </>
          )}
        </figcaption>
      </div>
    </figure>
  );
};

export default AgentBox;
