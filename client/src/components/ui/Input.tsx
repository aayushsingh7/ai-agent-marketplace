import { FC, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
}

const Input: FC<InputProps> = ({ className, ...props }) => {
  return (
    <input 
    type="text"
      className={`input ${className || ''}`}
      {...props}
      
    />
  );
};

export default Input;