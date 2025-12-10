'use client';
import { forwardRef, LabelHTMLAttributes, ReactNode } from 'react';
import styles from './Label.module.css';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children?: ReactNode;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={`${styles.label} ${className || ''}`}
        {...props}
      >
        {children}
      </label>
    );
  }
);

Label.displayName = 'Label';
