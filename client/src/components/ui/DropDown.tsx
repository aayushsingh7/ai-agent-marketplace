import { FC, useState } from "react";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";


interface DropDownProps {
    defaultValue:string;
    valuesList:string[];
    changeDefaultValue:any;
}

const DropDown: FC<DropDownProps> = ({defaultValue,valuesList,changeDefaultValue}) => {
  const [showDropDown,setShowDropDown] = useState<boolean>(false);
  return (
    <div className="drop_down">
     <span className="drop_down_main_content" onClick={()=> setShowDropDown(!showDropDown)}>{defaultValue} {showDropDown ? <IoIosArrowUp/> : <IoIosArrowDown/>}</span>
     {showDropDown && <div className="drop_down_option">
        {valuesList.filter((str:string)=> str !== defaultValue).map((str:string)=> {
            return <span onClick={()=> {changeDefaultValue(str);setShowDropDown(false)}}>{str}</span>
        })}
     </div>}
    </div>
  );
};

export default DropDown;