import { FC, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
}

const Input: FC<InputProps> = ({ className, ...props }) => {
  return (
    <input 
      className={`input ${className || ''}`}
      {...props}
    />
  );
};

export default Input;