import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { getButtonClasses } from '@/lib/design-system';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: getButtonClasses('primary'),
      secondary: getButtonClasses('secondary'),
      danger: getButtonClasses('danger'),
      ghost:
        'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 ' +
        'text-gray-700 dark:text-gray-300 inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 ' +
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
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
