import { FC, useEffect, useState } from "react";
import { useAppContext } from "../context/contextAPI";
import { useLocation, useNavigate } from "react-router-dom";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { FaInfoCircle } from "react-icons/fa";

interface VerifyUserProps {}

const VerifyUser: FC<VerifyUserProps> = ({}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { setLoggedInUser, setVerifyUser } = useAppContext();
  const [showInfo,setShowInfo] = useState<boolean>(false)
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setTimeout(()=>{
    setShowInfo(true)
    },3000)
    const authenticateUser = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/auth/verify`,
          {
            credentials: "include",
          }
        );
        let user = await response.json();
        if (response.status == 200) {
          setLoggedInUser(() => user.data);
        } else {
          if(location.pathname !== '/') navigate("/auth");
        }
      } catch (err) {
        console.error(err);
        navigate("/auth")
      }
      setLoading(false);
      setVerifyUser(() => false);
      setShowInfo(false)
    };
    authenticateUser();
  }, []);

  return (
    <div className="verify_page">
    {showInfo &&  <p className="warning_verify_page">
     <FaInfoCircle style={{fontSize:"40px",marginRight:"20px"}} /> <span>The free hosting server <strong>sleeps</strong> when idle and <strong>may take over a minute</strong> to wake up. Thanks for your patience!</span>
</p>}
      <div className="loader"></div>
      <div className="verify_text">
        <h3>Please wait...</h3>
        <p>Verifying user, it only gonna take couple of seconds</p>
      </div>
    </div>
  );
};

export default VerifyUser;
