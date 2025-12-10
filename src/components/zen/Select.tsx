'use client';
import { forwardRef, SelectHTMLAttributes, ReactNode } from 'react';
import styles from './Select.module.css';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children?: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`${styles.select} ${className || ''}`}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = 'Select';
