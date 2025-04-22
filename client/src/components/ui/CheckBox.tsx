import { FC, useState } from "react";
import { FaCheck } from "react-icons/fa";

interface CheckBoxProps {
    text:string;
    checkBoxStatus:boolean;
    changeCheckBoxStatus:any;
    description?:string;
 }

const CheckBox: FC<CheckBoxProps> = ({text="Accept Terms and Conditions",checkBoxStatus,changeCheckBoxStatus,description}) => {
    // const [checked,setChecked] = useState<boolean>(false)
    return (
    <label className={`checkbox_container ${checkBoxStatus ? "checked" : "unchecked"}`} onClick={()=> changeCheckBoxStatus((oldData:any)=> !oldData)}>
    <div className="checkbox" style={{flexShrink:"0"}}>
     <FaCheck/>
    </div>
     <div className="checkbox_text">
     {text}
     <p>{description}</p>
     </div>
  </label>
  
  );
};

export default CheckBox;