import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm',
          'rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50',
          'transition-all duration-300',
          hover && 'hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 hover:border-primary-300 dark:hover:border-primary-700',
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

export default Card;
