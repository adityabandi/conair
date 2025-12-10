'use client';
import { forwardRef, HTMLAttributes, ReactNode } from 'react';

export interface PressableProps extends HTMLAttributes<HTMLDivElement> {
  onPress?: () => void;
  isDisabled?: boolean;
  children?: ReactNode;
}

export const Pressable = forwardRef<HTMLDivElement, PressableProps>(
  ({ onPress, isDisabled, onClick, children, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isDisabled) {
        onPress?.();
        onClick?.(e);
      }
    };

    return (
      <div
        ref={ref}
        role="button"
        tabIndex={isDisabled ? -1 : 0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (!isDisabled && (e.key === 'Enter' || e.key === ' ')) {
            onPress?.();
          }
        }}
        style={{ cursor: isDisabled ? 'not-allowed' : 'pointer', opacity: isDisabled ? 0.5 : 1 }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Pressable.displayName = 'Pressable';
