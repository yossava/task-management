import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary:
        'bg-primary-600 hover:bg-primary-700 text-white ' +
        'shadow-lg hover:shadow-xl ' +
        'focus:ring-primary-500 transform hover:scale-[1.02] active:scale-[0.98]',
      secondary:
        'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ' +
        'border-2 border-gray-300 dark:border-gray-600 ' +
        'hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 ' +
        'shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]',
      danger:
        'bg-red-600 hover:bg-red-700 text-white ' +
        'shadow-lg hover:shadow-xl ' +
        'focus:ring-red-500 transform hover:scale-[1.02] active:scale-[0.98]',
      ghost:
        'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 ' +
        'text-gray-700 dark:text-gray-300',
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export default Button;
