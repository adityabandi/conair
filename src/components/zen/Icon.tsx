'use client';
import { forwardRef, HTMLAttributes, ReactNode } from 'react';
import styles from './Icon.module.css';

export interface IconProps extends HTMLAttributes<HTMLSpanElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  strokeColor?: 'default' | 'muted' | 'faint';
  children?: ReactNode;
}

export const Icon = forwardRef<HTMLSpanElement, IconProps>(
  ({ size = 'md', strokeColor = 'default', className, children, ...props }, ref) => {
    const classes = [
      styles.icon,
      styles[`size-${size}`],
      styles[`color-${strokeColor}`],
      className,
    ].filter(Boolean).join(' ');

    return (
      <span ref={ref} className={classes} {...props}>
        {children}
      </span>
    );
  }
);

Icon.displayName = 'Icon';

export interface IconLabelProps extends HTMLAttributes<HTMLSpanElement> {
  icon?: ReactNode;
  children?: ReactNode;
}

export const IconLabel = forwardRef<HTMLSpanElement, IconLabelProps>(
  ({ icon, className, children, ...props }, ref) => {
    return (
      <span ref={ref} className={`${styles.iconLabel} ${className || ''}`} {...props}>
        {icon && <Icon size="sm">{icon}</Icon>}
        {children}
      </span>
    );
  }
);

IconLabel.displayName = 'IconLabel';
