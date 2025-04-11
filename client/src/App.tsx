import { FC } from "react";
import { Routes,Route } from "react-router-dom";
import Home from "./pages/Home";
import MarketPlace from "./pages/MarketPlace";
import ViewAgent from "./pages/ViewAgent";
import Subscription from "./pages/Subscription";
import Upload from "./pages/Upload";
import Settings from "./pages/Settings";
import SideNav from "./layouts/SideNav";

interface AppProps { }

const App: FC<AppProps> = ({ }) => {
  return (
    <div>
     <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/subscriptions" element={<div className="flex-page"><SideNav/><Subscription/></div>}/>
        <Route path="/upload" element={<div className="flex-page"><SideNav/><Upload/></div>}/>
        <Route path="/settings" element={<div className="flex-page"><SideNav/><Settings/></div>} />
        <Route path="/marketplace" element={<div className="flex-page"><SideNav/><MarketPlace/></div>}/>
        <Route path="/marketplace/agents/:agentID" element={<ViewAgent/>}/>
     </Routes>
    </div>
  );
};

export default App;