/**
 * Design System - Centralized design tokens and theme configuration
 * Use these constants throughout the application for consistent styling
 */

export const designSystem = {
  // Color Palette - Premium Gradients
  colors: {
    primary: {
      gradient: 'from-blue-600 via-blue-700 to-indigo-700',
      gradientHover: 'from-blue-700 via-blue-800 to-indigo-800',
      shadow: 'shadow-blue-500/50',
      shadowHover: 'shadow-blue-600/60',
      glow: 'from-blue-600 to-indigo-600',
    },
    secondary: {
      gradient: 'from-indigo-600 via-indigo-700 to-purple-700',
      gradientHover: 'from-indigo-700 via-indigo-800 to-purple-800',
      shadow: 'shadow-indigo-500/50',
      shadowHover: 'shadow-indigo-600/60',
      glow: 'from-indigo-600 to-purple-600',
    },
    accent: {
      gradient: 'from-purple-600 via-purple-700 to-pink-700',
      gradientHover: 'from-purple-700 via-purple-800 to-pink-800',
      shadow: 'shadow-purple-500/50',
      shadowHover: 'shadow-purple-600/60',
      glow: 'from-purple-600 to-pink-600',
    },
    danger: {
      gradient: 'from-red-600 to-rose-600',
      gradientHover: 'from-red-700 to-rose-700',
      shadow: 'shadow-red-500/50',
      shadowHover: 'shadow-red-600/60',
    },
  },

  // Icon Box Styles - Premium glass morphism with gradients
  iconBox: {
    primary: {
      container: 'relative w-16 h-16 rounded-2xl',
      glow: 'absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity',
      background: 'relative w-full h-full bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/50',
      icon: 'w-8 h-8 text-white',
    },
    secondary: {
      container: 'relative w-16 h-16 rounded-2xl',
      glow: 'absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity',
      background: 'relative w-full h-full bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/50',
      icon: 'w-8 h-8 text-white',
    },
    accent: {
      container: 'relative w-16 h-16 rounded-2xl',
      glow: 'absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity',
      background: 'relative w-full h-full bg-gradient-to-br from-purple-600 via-purple-700 to-pink-700 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/50',
      icon: 'w-8 h-8 text-white',
    },
  },

  // Logo Styles
  logo: {
    container: 'relative',
    glow: 'absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur-md opacity-75 group-hover:opacity-100 transition-opacity',
    background: 'relative w-10 h-10 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50 transform group-hover:scale-110 transition-all',
    icon: 'w-6 h-6 text-white',
    text: 'text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent',
  },

  // Button Variants
  button: {
    primary: {
      base: 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 text-white relative overflow-hidden',
      shadow: 'shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-600/60',
      ring: 'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
      shimmer: 'before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/0 before:via-white/20 before:to-white/0 before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700',
    },
    secondary: {
      base: 'bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-900 dark:text-gray-100',
      border: 'border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500',
      shadow: 'shadow-md hover:shadow-lg',
    },
    danger: {
      base: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white',
      shadow: 'shadow-lg shadow-red-500/50 hover:shadow-xl hover:shadow-red-600/60',
      ring: 'focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
    },
  },

  // Card Decorations
  cardDecoration: {
    primary: 'bg-gradient-to-br from-blue-400/30 via-blue-500/20 to-transparent dark:from-blue-600/20 dark:to-transparent',
    secondary: 'bg-gradient-to-br from-indigo-400/30 via-indigo-500/20 to-transparent dark:from-indigo-600/20 dark:to-transparent',
    accent: 'bg-gradient-to-br from-purple-400/30 via-purple-500/20 to-transparent dark:from-purple-600/20 dark:to-transparent',
  },

  // Animation & Transform
  animations: {
    scaleHover: 'transform hover:scale-[1.02] active:scale-[0.98]',
    iconHover: 'transform group-hover:scale-110 group-hover:rotate-3 transition-all',
    cardHover: 'group-hover:scale-150 transition-transform duration-500',
  },
} as const;

// Helper function to build icon box classes
export function getIconBoxClasses(variant: 'primary' | 'secondary' | 'accent') {
  const styles = designSystem.iconBox[variant];
  return {
    container: `${styles.container} ${designSystem.animations.iconHover}`,
    glow: styles.glow,
    background: styles.background,
    icon: styles.icon,
  };
}

// Helper function to build button classes
export function getButtonClasses(variant: 'primary' | 'secondary' | 'danger') {
  const base = 'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200';
  const disabled = 'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';

  if (variant === 'primary') {
    const styles = designSystem.button.primary;
    return `${base} ${styles.base} ${styles.shadow} ${styles.ring} ${styles.shimmer} ${designSystem.animations.scaleHover} ${disabled}`;
  } else if (variant === 'secondary') {
    const styles = designSystem.button.secondary;
    return `${base} ${styles.base} ${styles.border} ${styles.shadow} ${designSystem.animations.scaleHover} ${disabled}`;
  } else {
    const styles = designSystem.button.danger;
    return `${base} ${styles.base} ${styles.shadow} ${styles.ring} ${designSystem.animations.scaleHover} ${disabled}`;
  }
}
