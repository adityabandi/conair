'use client';
import { forwardRef, HTMLAttributes, CSSProperties, ReactNode } from 'react';
import styles from './Layout.module.css';

export interface RowProps extends HTMLAttributes<HTMLDivElement> {
  gap?: string | number;
  alignItems?: CSSProperties['alignItems'];
  justifyContent?: CSSProperties['justifyContent'];
  flexWrap?: CSSProperties['flexWrap'];
  children?: ReactNode;
}

export interface ColumnProps extends HTMLAttributes<HTMLDivElement> {
  gap?: string | number;
  alignItems?: CSSProperties['alignItems'];
  justifyContent?: CSSProperties['justifyContent'];
  children?: ReactNode;
}

export const Row = forwardRef<HTMLDivElement, RowProps>(
  ({ gap, alignItems, justifyContent, flexWrap, style, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`${styles.row} ${className || ''}`}
        style={{
          gap: typeof gap === 'number' ? `${gap}px` : gap,
          alignItems,
          justifyContent,
          flexWrap,
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Row.displayName = 'Row';

export const Column = forwardRef<HTMLDivElement, ColumnProps>(
  ({ gap, alignItems, justifyContent, style, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`${styles.column} ${className || ''}`}
        style={{
          gap: typeof gap === 'number' ? `${gap}px` : gap,
          alignItems,
          justifyContent,
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Column.displayName = 'Column';
