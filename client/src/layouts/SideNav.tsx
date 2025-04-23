import { FC, useEffect, useState } from "react";
import styles from "../styles/layouts/SideNav.module.css";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/contextAPI";

interface SideNavProps {
  type: "normal" | "small";
  selectedTab?: number;
  setTab?: any;
}

const SideNav: FC<SideNavProps> = ({ type, setTab, selectedTab }) => {
  const { loggedInUser , selectedAgent} = useAppContext();
  const [selectedRoute, setSelectedRoute] = useState("/");
  const navigate = useNavigate();

  useEffect(() => {
    setSelectedRoute(location.pathname);
  }, [location.pathname]);

  return (
    <nav className={`${styles.sidenav} ${styles.show} ${styles[type]}`}>
      <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
        <h2
          onClick={() => navigate("/marketplace")}
          style={{ cursor: "pointer" }}
        >
          Sei<span>Agents</span>
        </h2>
        <div className={styles.seprator}>
        {selectedRoute.startsWith("/marketplace/agents") ? (
          <ul>
            <li
              style={{ fontWeight: selectedTab == 1 ? 600 : 500 }}
              onClick={() => setTab(1)}
            >
              1.1 Overview
            </li>
            <li
              style={{ fontWeight: selectedTab == 2 ? 600 : 500 }}
              onClick={() => setTab(2)}
            >
              1.2 Documentation
            </li>
            {(selectedAgent && loggedInUser?.walletAddress != selectedAgent?.owner.walletAddress) && <li
              style={{ fontWeight: selectedTab == 3 ? 600 : 500 }}
              onClick={() =>
                loggedInUser?._id ? setTab(3) : navigate("/auth")
              }
            >
              1.3 Buy Credits
            </li>}
          </ul>
        ) : (
          <ul>
            <li
              style={{
                background:
                  selectedRoute == "/marketplace" ? "#efefef" : "#ffffff",
              }}
            >
              <Link to="/marketplace">Market Place</Link>
            </li>
            <li
              style={{
                background: selectedRoute.startsWith("/subscriptions")
                  ? "#efefef"
                  : "#ffffff",
              }}
            >
              <Link to={loggedInUser?._id ? "/subscriptions" : "/auth"}>
                Subscriptions
              </Link>
            </li>
            <li
              style={{
                background: selectedRoute == "/nfts" ? "#efefef" : "#ffffff",
              }}
            >
              <Link to={loggedInUser?._id ? "/nfts" : "/auth"}>
                Owned NFTs
              </Link>
            </li>
            <li
              style={{
                background: selectedRoute == "/upload" ? "#efefef" : "#ffffff",
              }}
            >
              <Link to={loggedInUser?._id ? "/upload" : "/auth"}>
                Upload Agent
              </Link>
            </li>
          </ul>
        )}

       {!location.pathname.startsWith("/marketplace/agents") &&  <ul>
          <li
            style={{
              background: selectedRoute == "/settings" ? "#efefef" : "#ffffff",
            }}
          >
            <Link to="/account-info">Account Info</Link>
          </li>

          <li
            style={{
              background: selectedRoute == "/logout" ? "#efefef" : "#ffffff",
            }}
          >
            <Link to="/logout">Logout</Link>
          </li>
        </ul>}
        </div>
      </div>
    </nav>
  );
};

export default SideNav;
