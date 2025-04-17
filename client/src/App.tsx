import { FC } from "react";
import { Routes,Route } from "react-router-dom";
import Home from "./pages/Home";
import MarketPlace from "./pages/MarketPlace";
import ViewAgent from "./pages/ViewAgent";
import Subscription from "./pages/Subscription";
import Upload from "./pages/Upload";
import Settings from "./pages/Settings";
import SideNav from "./layouts/SideNav";
import Auth from "./pages/Auth";
import Usage from "./pages/Usage";

interface AppProps { }

const App: FC<AppProps> = ({ }) => {
  return (
    <div>
     <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/subscriptions" element={<div className="flex-page"><SideNav type="normal"/><Subscription/></div>}/>
        <Route path="/upload" element={<div className="flex-page"><SideNav type="normal"/><Upload/></div>}/>
        <Route path="/settings" element={<div className="flex-page"><SideNav type="normal"/><Settings/></div>} />
        <Route path="/marketplace" element={<div className="flex-page"><SideNav type="normal"/><MarketPlace/></div>}/>
        <Route path="/marketplace/agents/:agentID" element={<ViewAgent/>}/>
        <Route path="/subscriptions/agents/:agentID" element={<div className="flex-page"><SideNav type="normal"/><Usage/></div>}/>
        <Route path="/auth" element={<Auth/>} />
     </Routes>
    </div>
  );
};

export default App;