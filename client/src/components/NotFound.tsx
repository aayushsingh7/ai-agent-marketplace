import { FC } from "react";

interface NotFoundProps { 
    text:string;
}

const NotFound: FC<NotFoundProps> = ({text="Nothing Found"}) => {
  return (
    <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "150px 20px",
    }}
  >
    <h5>{text}</h5>{" "}
  </div>
  );
};

export default NotFound;