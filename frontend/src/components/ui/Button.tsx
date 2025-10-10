import type { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
}: ButtonProps) => {
  const baseClasses = 'font-inter font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'text-white shadow-md hover:shadow-lg focus:ring-2',
    secondary: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 focus:ring-blue-500',
    outline: 'border-2 text-white hover:shadow-lg focus:ring-2',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  
  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`;
  
  const getButtonStyle = () => {
    if (variant === 'primary') {
      return { background: 'linear-gradient(135deg, #ec5766 0%, #da344d 100%)' };
    }
    if (variant === 'outline') {
      return { 
        borderColor: '#ec5766',
        color: '#da344d',
        background: 'transparent'
      };
    }
    return {};
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    
    if (variant === 'primary') {
      e.currentTarget.style.background = 'linear-gradient(135deg, #da344d 0%, #c42348 100%)';
    } else if (variant === 'outline') {
      e.currentTarget.style.background = 'linear-gradient(135deg, #ec5766 0%, #da344d 100%)';
      e.currentTarget.style.color = 'white';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    
    if (variant === 'primary') {
      e.currentTarget.style.background = 'linear-gradient(135deg, #ec5766 0%, #da344d 100%)';
    } else if (variant === 'outline') {
      e.currentTarget.style.background = 'transparent';
      e.currentTarget.style.color = '#da344d';
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedClasses}
      style={getButtonStyle()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </button>
  );
};

export default Button;