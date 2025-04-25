import { FC } from "react";
import { AiOutlineMenu } from "react-icons/ai";
import Button from "../components/ui/Button";
import { useNavigate } from "react-router-dom";
import styles from "../styles/layouts/Navbar.module.css"
import { useAppContext } from "../context/contextAPI";

interface NavbarProps {
  btn: boolean;
  permanent?:boolean;
}

const Navbar: FC<NavbarProps> = ({ btn = false,permanent=false }) => {
const {setShowSideNav} = useAppContext();
  const navigate = useNavigate();
  return (
    <header className={`${styles.navbar} ${permanent ? styles.permanent : styles.temp}`}>
      <nav>
        <h4 style={{cursor:"pointer"}} onClick={() => navigate("/marketplace")}>
          Sei<span>Agents</span> {permanent ? null : <span style={{margin:"0px 7px",fontSize:"20px"}}>{">"}</span>} <span>{location.pathname.startsWith("/marketplace") ? "Marketplace" : location.pathname.startsWith("/subscriptions") ? "Subscription" : location.pathname.startsWith("/upload") ? "Upload" : location.pathname.startsWith("/nfts") ? "NFTs" : location.pathname.startsWith("/account-info") ? "Details" :  ""}</span>
        </h4>
        {btn ? (
          <Button onClick={() => navigate("/auth")}>Connect Wallet</Button>
        ) : (
          <AiOutlineMenu style={{ fontSize: "30px" }} onClick={()=> setShowSideNav(true)} />
        )}
      </nav>
    </header>
  );
};

export default Navbar;
