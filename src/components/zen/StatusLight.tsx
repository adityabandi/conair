'use client';
import { forwardRef, HTMLAttributes } from 'react';
import styles from './StatusLight.module.css';

export interface StatusLightProps extends HTMLAttributes<HTMLSpanElement> {
  color?: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
}

export const StatusLight = forwardRef<HTMLSpanElement, StatusLightProps>(
  ({ color, variant = 'default', className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={`${styles.light} ${styles[variant]} ${className || ''}`}
        style={color ? { backgroundColor: color } : undefined}
        {...props}
      />
    );
  }
);

StatusLight.displayName = 'StatusLight';
