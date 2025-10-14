import { forwardRef } from 'react';
import type { ReactNode } from 'react';

interface ScrollAnimatedSectionProps {
  children: ReactNode;
  className?: string;
  animation?: 'fadeInUp' | 'fadeInDown' | 'fadeInLeft' | 'fadeInRight' | 'fadeIn' | 'scaleIn' | 'slideInUp' | 'slideInDown';
  delay?: number;
  duration?: number;
  isVisible: boolean;
}

const ScrollAnimatedSection = forwardRef<HTMLDivElement, ScrollAnimatedSectionProps>(
  ({ children, className = '', animation = 'fadeInUp', delay = 0, isVisible }, ref) => {
    const getAnimationClasses = () => {
      const baseClasses = 'transition-all duration-700 ease-out';
      
      if (!isVisible) {
        switch (animation) {
          case 'fadeInUp':
            return `${baseClasses} opacity-0 translate-y-8`;
          case 'fadeInDown':
            return `${baseClasses} opacity-0 -translate-y-8`;
          case 'fadeInLeft':
            return `${baseClasses} opacity-0 -translate-x-8`;
          case 'fadeInRight':
            return `${baseClasses} opacity-0 translate-x-8`;
          case 'fadeIn':
            return `${baseClasses} opacity-0`;
          case 'scaleIn':
            return `${baseClasses} opacity-0 scale-95`;
          case 'slideInUp':
            return `${baseClasses} translate-y-full`;
          case 'slideInDown':
            return `${baseClasses} -translate-y-full`;
          default:
            return `${baseClasses} opacity-0 translate-y-8`;
        }
      }
      
      return `${baseClasses} opacity-100 translate-y-0 translate-x-0 scale-100`;
    };

    const delayStyle = delay > 0 ? { transitionDelay: `${delay}ms` } : {};

    return (
      <div
        ref={ref}
        className={`${getAnimationClasses()} ${className}`}
        style={delayStyle}
      >
        {children}
      </div>
    );
  }
);

ScrollAnimatedSection.displayName = 'ScrollAnimatedSection';

export default ScrollAnimatedSection;