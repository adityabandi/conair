'use client';
import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'quiet' | 'danger' | 'zero';
  size?: 'sm' | 'md' | 'lg';
  isDisabled?: boolean;
  onPress?: () => void;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', isDisabled, onPress, onClick, className, children, ...props }, ref) => {
    const classes = [
      styles.button,
      styles[variant],
      styles[size],
      className,
    ].filter(Boolean).join(' ');

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (onPress) onPress();
      if (onClick) onClick(e);
    };

    return (
      <button
        ref={ref}
        className={classes}
        disabled={isDisabled}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
