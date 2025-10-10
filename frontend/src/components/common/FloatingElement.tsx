import type { ReactNode } from 'react';

interface FloatingElementProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

const FloatingElement = ({ children, className = '', delay = 0, duration = 3 }: FloatingElementProps) => {
  const style = {
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
  };

  return (
    <div 
      className={`animate-bounce ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

export default FloatingElement;