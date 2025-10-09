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
        'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 ' +
        'shadow-lg shadow-primary-500/50 hover:shadow-xl hover:shadow-primary-600/50 ' +
        'focus:ring-primary-500 transform hover:scale-[1.02] active:scale-[0.98]',
      secondary:
        'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ' +
        'border-2 border-gray-300 dark:border-gray-600 ' +
        'hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 ' +
        'shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]',
      danger:
        'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 ' +
        'shadow-lg shadow-red-500/50 hover:shadow-xl hover:shadow-red-600/50 ' +
        'focus:ring-red-500 transform hover:scale-[1.02] active:scale-[0.98]',
      ghost:
        'bg-transparent hover:bg-gray-100/80 dark:hover:bg-gray-800/80 ' +
        'text-gray-700 dark:text-gray-300 hover:backdrop-blur-sm',
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
