import { FC, useState } from "react";
import styles from "../styles/components/PaymentBill.module.css";
import CheckBox from "./ui/CheckBox";
import Button from "./ui/Button";

interface PaymentBillProps {
  creditAmount: number;
  agent: any;
  func: any;
  width: string;
  type: "credit" | "nft";
  className?:string;
}

const PaymentBill: FC<PaymentBillProps> = ({
  creditAmount,
  agent,
  func,
  width,
  type,
  className,
}) => {
  const [agree, setAgree] = useState<boolean>(false);
  return (
    <section
      style={{ width }}
      className={`${styles.section_four} ${styles.payment} ${className}`}
    >
      <div className={styles.payment_box}>
        <h4>Payment Summary</h4>
        <div className={styles.blocks}>
          {type == "nft" ? (
            <p>
              <span>NFT Price:</span> <strong>{agent.salePrice} SEI</strong>
            </p>
          ) : (
            <>
              <p>
                <span>Total Credits:</span> <strong>{creditAmount}</strong>
              </p>
              <p>
                <span>Cost Per Credit:</span>{" "}
                <strong>{agent?.rentingDetails?.costPerCredit} SEI</strong>
              </p>
            </>
          )}
        </div>
        <div className={styles.blocks}>
          <p>
            <span>Blockchain:</span> <strong>$SEI</strong>
          </p>
        </div>
        <div className={styles.blocks}>
          <p>
            <span>Total:</span>{" "}
            <strong>
              {type == "nft"
                ? agent.salePrice
                : agent?.rentingDetails?.costPerCredit * creditAmount}{" "}
              SEI
            </strong>
          </p>
          <p>
            <span>Gas Fee:</span> <strong>N/A</strong>
          </p>
        </div>
        <div className={styles.blocks}>
          <p>
            <strong>GRAND TOTAL:</strong>{" "}
            <strong>
              {type == "nft"
                ? agent.salePrice
                : agent?.rentingDetails?.costPerCredit * creditAmount}{" "}
              SEI
            </strong>
          </p>
        </div>
      </div>

      <div>
        <CheckBox
          description={
            "By checking it, you agree that the money will be deducted from your metamask wallet automatically"
          }
          changeCheckBoxStatus={setAgree}
          checkBoxStatus={agree}
          text="Confirm Payment"
        />
        <Button
          disabled={!agree}
          onClick={func}
          style={{
            fontSize: "0.8rem",
            padding: "15px 20px",
            width: "100%",
            color: "#ffffff",
            background: "#b30000",
            borderRadius: "5px",
            marginTop: "10px",
          }}
        >
          Proceed to Pay via MetaMask
        </Button>
      </div>
    </section>
  );
};

export default PaymentBill;
