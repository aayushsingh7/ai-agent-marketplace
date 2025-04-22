import { FC, useEffect } from "react";
import Notification from "../utils/notification";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/contextAPI";

interface LogoutProps { }

const Logout: FC<LogoutProps> = ({ }) => {
const navigate = useNavigate()
const {setLoggedInUser} = useAppContext()
useEffect(()=> {
  const logoutFunc = async()=> {
    try {
     const response = await fetch(`${import.meta.env.VITE_API_URL}/users/logout`,{credentials:"include",method:"DELETE"})
     if(response.ok) {
        navigate("/auth")
        Notification.success("Logout Successfully")
        setLoggedInUser({})
     }
    } catch (err) {
        Notification.error("Oops! something went wrong while logging out")
        navigate(-1)
    }
  }
  logoutFunc();
},[])
  return (
    <div>
      <h2>Logging Out...</h2>
    </div>
  );
};

export default Logout;