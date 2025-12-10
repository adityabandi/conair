'use client';
import { forwardRef, InputHTMLAttributes } from 'react';
import styles from './TextField.module.css';

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  isInvalid?: boolean;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ isInvalid, className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`${styles.input} ${isInvalid ? styles.invalid : ''} ${className || ''}`}
        {...props}
      />
    );
  }
);

TextField.displayName = 'TextField';
