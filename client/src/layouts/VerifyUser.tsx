import { FC, useEffect, useState } from "react";
import { useAppContext } from "../context/contextAPI";
import { useNavigate } from "react-router-dom";

interface VerifyUserProps {}

const VerifyUser: FC<VerifyUserProps> = ({}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { setLoggedInUser, setVerifyUser } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
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
          setVerifyUser(() => false);
        } else {
          navigate("/auth");
        }
      } catch (err) {
        console.error(err);
        navigate("/auth")
      }
      setLoading(false);
    };
    authenticateUser();
  }, []);

  return (
    <div className="verify_page">
      <div className="loader"></div>
      <div className="verify_text">
        <h3>Please wait...</h3>
        <p>Verifying user, it only gonna take couple of seconds</p>
      </div>
    </div>
  );
};

export default VerifyUser;
