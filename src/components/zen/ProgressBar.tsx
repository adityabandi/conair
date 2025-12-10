'use client';
import { forwardRef, HTMLAttributes } from 'react';
import styles from './ProgressBar.module.css';

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
}

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ value = 0, max = 100, className, ...props }, ref) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    return (
      <div ref={ref} className={`${styles.track} ${className || ''}`} {...props}>
        <div className={styles.fill} style={{ width: `${percentage}%` }} />
      </div>
    );
  }
);

ProgressBar.displayName = 'ProgressBar';
