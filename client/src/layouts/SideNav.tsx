import { FC, useEffect, useState } from "react";
import styles from "../styles/layouts/SideNav.module.css"
import { Link } from "react-router-dom";

interface SideNavProps { }

const SideNav: FC<SideNavProps> = ({ }) => {
  const [selectedRoute, setSelectedRoute] = useState("/")
  useEffect(() => {
      setSelectedRoute(location.pathname)
  }, [location.pathname])
  return (
      <nav className={`${styles.sidenav} ${styles.show}`}>
          <div>
              <h2>Sei<span>Agents</span></h2>
              <ul>
                  <li style={{ background: selectedRoute == "/marketplace" ? "#efefef" : "#ffffff" }} ><Link to="/marketplace">Market Place</Link></li>
                  <li style={{ background: selectedRoute == "/subscriptions" ? "#efefef" : "#ffffff" }}><Link to="/subscriptions">Subscriptions</Link></li>
                  <li style={{ background: selectedRoute == "/upload" ? "#efefef" : "#ffffff" }}><Link to="/upload">Upload Agent</Link></li>
                  <li style={{ background: selectedRoute == "/settings" ? "#efefef" : "#ffffff" }}><Link to="/settings">Setting</Link></li>
              </ul>
          </div>



      </nav>
  )
};

export default SideNav;