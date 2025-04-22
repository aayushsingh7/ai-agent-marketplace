import { FC } from "react";
import { useAppContext } from "../context/contextAPI";

interface ProcessingProps {
}

const Processing: FC<ProcessingProps> = ({}) => {
  const {processingDescription,processingText} = useAppContext()
  return (
    <div className="processing_container">
      <div className="processing_box">
            <div className="loader_2"></div>
            <h4>{processingText}</h4>
            <p>{processingDescription}</p>
      </div>
    </div>
  );
};

export default Processing;