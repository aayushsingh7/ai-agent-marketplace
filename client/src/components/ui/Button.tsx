import { FC, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
}

const Button: FC<ButtonProps> = ({ 
  children, 
  ...props 
}) => {

  return (
    <button  className="button"
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;