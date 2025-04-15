import { FC, useEffect, useState } from "react";
import styles from "../styles/layouts/SideNav.module.css"
import { Link } from "react-router-dom";

interface SideNavProps { 
    type:"normal" | "small";
    selectedTab?:number;
    setTab?:any;
}

const SideNav: FC<SideNavProps> = ({type, setTab, selectedTab}) => {
  const [selectedRoute, setSelectedRoute] = useState("/")
  useEffect(() => {
      setSelectedRoute(location.pathname)
  }, [location.pathname])
  return (
      <nav className={`${styles.sidenav} ${styles.show} ${styles[type]}`}>
          <div>
              <h2>Sei<span>Agents</span></h2>
              {
                selectedRoute.startsWith("/marketplace/agents") ? 
                <ul>
                  <li style={{ fontWeight: selectedTab == 1 ? 600 : 500 }} onClick={()=> setTab(1)}>1.1 Overview</li>
                  <li style={{ fontWeight: selectedTab == 2 ? 600 : 500 }} onClick={()=> setTab(2)}>1.2 Documentation</li>
                  <li style={{ fontWeight: selectedTab == 3 ? 600 : 500 }} onClick={()=> setTab(3)}>1.3 Subscription</li>
              </ul> : 
              <ul>
              <li style={{ background: selectedRoute == "/marketplace" ? "#efefef" : "#ffffff" }} ><Link to="/marketplace">Market Place</Link></li>
              <li style={{ background: selectedRoute == "/subscriptions" ? "#efefef" : "#ffffff" }}><Link to="/subscriptions">Subscriptions</Link></li>
              <li style={{ background: selectedRoute == "/upload" ? "#efefef" : "#ffffff" }}><Link to="/upload">Upload Agent</Link></li>
              <li style={{ background: selectedRoute == "/settings" ? "#efefef" : "#ffffff" }}><Link to="/settings">Setting</Link></li>
          </ul>
              }
          </div>



      </nav>
  )
};

export default SideNav;