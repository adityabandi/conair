'use client';
import { forwardRef, HTMLAttributes, ReactNode } from 'react';
import styles from './Grid.module.css';

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  columns?: string;
  rows?: string;
  gap?: string | number;
  overflow?: string;
  children?: ReactNode;
}

export const Grid = forwardRef<HTMLDivElement, GridProps>(
  ({ columns, rows, gap, overflow, style, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`${styles.grid} ${className || ''}`}
        style={{
          gridTemplateColumns: columns,
          gridTemplateRows: rows,
          gap: typeof gap === 'number' ? `${gap}px` : gap,
          overflow,
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Grid.displayName = 'Grid';
