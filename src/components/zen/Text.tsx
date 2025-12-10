'use client';
import { forwardRef, HTMLAttributes, ReactNode } from 'react';
import styles from './Text.module.css';

export interface TextProps extends HTMLAttributes<HTMLSpanElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'default' | 'muted' | 'faint' | 'success' | 'error' | 'warning';
  align?: 'left' | 'center' | 'right';
  children?: ReactNode;
}

export const Text = forwardRef<HTMLSpanElement, TextProps>(
  ({ size = 'md', weight = 'normal', color = 'default', align, style, className, children, ...props }, ref) => {
    const classes = [
      styles.text,
      styles[`size-${size}`],
      styles[`weight-${weight}`],
      styles[`color-${color}`],
      className,
    ].filter(Boolean).join(' ');

    return (
      <span
        ref={ref}
        className={classes}
        style={{ textAlign: align, ...style }}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Text.displayName = 'Text';
