import { FC, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
}

const Button: FC<ButtonProps> = ({ 
  children, 
  className, 
//   variant = 'primary', 
  ...props 
}) => {
//   const baseClasses = 'px-4 py-2 rounded font-medium transition-colors';
  
//   const variantClasses = {
//     primary: 'bg-blue-600 text-white hover:bg-blue-700',
//     secondary: 'bg-gray-600 text-white hover:bg-gray-700',
//     outline: 'border border-blue-600 text-blue-600 hover:bg-blue-50'
//   };
  
  return (
    <button 
    //   className={`
    //     ${baseClasses} ${variantClasses[variant]} ${className || ''}`
    // }
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;