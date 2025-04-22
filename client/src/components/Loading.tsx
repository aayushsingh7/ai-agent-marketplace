import { FC } from "react";

interface LoadingProps {}

const Loading: FC<LoadingProps> = ({}) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "150px 20px",
      }}
    >
      <h5>Loading...</h5>{" "}
    </div>
  );
};

export default Loading;
