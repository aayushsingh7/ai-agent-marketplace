import { FC, useEffect, useState } from "react";
import styles from "../styles/pages/Upload.module.css";
import Input from "./ui/Input";
import CheckBox from "./ui/CheckBox";
import { useAppContext } from "../context/contextAPI";
import Button from "./ui/Button";
import { ethers } from "ethers";
import Notification from "../utils/notification";

interface EditNFTProps {}

const EditNFT: FC<EditNFTProps> = ({}) => {
    const {editNFT,selectedAgent,setEditNFT} = useAppContext()
  const [isForSale, setIsForSale] = useState<boolean>(false);
  const [costPerCredit,setCostPerCredit] = useState<number>(0.001)
  const [agentSalePrice,setAgentSalePrice] = useState<number>(0)

  useEffect(()=> {
    setIsForSale(selectedAgent?.isForSale)
    setCostPerCredit(selectedAgent?.rentingDetails?.costPerCredit)
    setAgentSalePrice(()=> selectedAgent?.salePrice)
  },[editNFT])


  return (
    <div className="rgba" onClick={()=> setEditNFT(()=> false)}>
      <div className={`edit_nft_box ${styles.upload_page}`} onClick={(e)=> e.stopPropagation()}>
        <h4>Edit NFT Details</h4>
        <div style={{marginTop:"50px"}}>
          <div className={styles.input_field}>
            <CheckBox
              description={
                "By checking it, you will be able to sell your agents as NFTs"
              }
              changeCheckBoxStatus={setIsForSale}
              checkBoxStatus={isForSale}
              text="Sell Agent As NFT"
            />

            <div className={styles.input_field}>
              <span>Enter Agent Selling Price ($SEI Token QTY)</span>
              <Input
                onChange={(e) => setAgentSalePrice(parseInt(e.target.value))}
                placeholder=""
                type="number"
                min={1}
                max={1000}
                step={1}
                defaultValue={selectedAgent?.salePrice}
              />
            </div>

            <div className={styles.input_field}>
              <span>
                Cost Per Credit (how many sei is reqiured to buy 1 credit)
              </span>
              <Input
                //  value={costPerCredit}
                onChange={(e) => setCostPerCredit(parseFloat(e.target.value))}
                type="number"
                min={0.001}
                max={0.08}
                defaultValue={selectedAgent?.rentingDetails?.costPerCredit}
                step={0.001}
              />
            </div>
          </div>
        </div>

        <Button onClick={()=> Notification.info("This feature will be available soon")} className={styles.main_button}>Save Changes</Button>
      </div>
    </div>
  );
};

export default EditNFT;
