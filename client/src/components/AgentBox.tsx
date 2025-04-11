import { FC } from "react";
import styles from "../styles/components/AgentBox.module.css"
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { FaClock, FaStar } from "react-icons/fa";
import { BiSolidDollarCircle } from "react-icons/bi";
import { Link } from "react-router-dom";




interface AgentBoxProps { }

const AgentBox: FC<AgentBoxProps> = ({ }) => {
  return (
   <Link to={"/marketplace/agents/139029099r49"}>
    <figure className={styles.agent_box_main}>
        <p title="Agent Category" className={styles.agent_type_tag}>Booking Agent</p>
        <div className={styles.agent_box}>
        <div className={styles.image_section}>
        <div className={styles.agent_image}>
            <img src="https://cdn.britannica.com/47/246247-050-F1021DE9/AI-text-to-image-photo-robot-with-computer.jpg " alt="" />
        </div>
        </div>
       <figcaption className={styles.agent_caption}>
         <h4>Aurthor<span><RiVerifiedBadgeFill /></span></h4>
         <p>This is a booking agent which is capable of booking any types of tickets, supports more then 10 types of mainstream booking websites</p>
        <div className={styles.tags_container}>
            <span aria-label="Reviews" title="Reviews out of 10" className={styles.tag}><FaStar/> 9.7 (123)</span>
            <span className={styles.tag} aria-label="Response Time (ms)" title="Response Time (ms)"><FaClock /> 110 ms</span>
            <span className={styles.tag} aria-label="Plan Type" title="Plan Type" ><BiSolidDollarCircle style={{fontSize:"16px"}}/> Paid</span>
        </div>

        <span className={styles.total_used}>Created by <span>aayushsingh7</span></span>
       </figcaption>
        </div>
    </figure>
    </Link>
  );
};

export default AgentBox;