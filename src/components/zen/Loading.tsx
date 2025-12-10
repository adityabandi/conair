'use client';
import { forwardRef, HTMLAttributes } from 'react';
import styles from './Loading.module.css';

export interface LoadingProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

export const Loading = forwardRef<HTMLDivElement, LoadingProps>(
  ({ size = 'md', className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`${styles.loading} ${styles[size]} ${className || ''}`}
        {...props}
      >
        <div className={styles.spinner} />
      </div>
    );
  }
);

Loading.displayName = 'Loading';
