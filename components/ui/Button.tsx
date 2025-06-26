
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseClasses = 'px-6 py-2.5 rounded-md font-semibold text-sm shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantClasses = {
    primary: 'bg-[#a3ccab] text-[#212529] hover:bg-opacity-90 focus:ring-[#a3ccab]',
    secondary: 'bg-white text-[#22573b] border border-[#22573b] hover:bg-gray-50 focus:ring-[#22573b]',
    ghost: 'bg-transparent text-[#212529] hover:bg-gray-200 focus:ring-gray-400 shadow-none',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
