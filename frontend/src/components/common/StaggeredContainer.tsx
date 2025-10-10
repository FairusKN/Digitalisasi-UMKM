import { forwardRef } from 'react';
import type { ReactNode } from 'react';

interface StaggeredContainerProps {
  children: ReactNode;
  className?: string;
}

const StaggeredContainer = forwardRef<HTMLDivElement, StaggeredContainerProps>(
  ({ children, className = '' }, ref) => {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }
);

StaggeredContainer.displayName = 'StaggeredContainer';

export default StaggeredContainer;