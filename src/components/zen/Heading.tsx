'use client';
import { forwardRef, HTMLAttributes, ReactNode, ElementType } from 'react';
import styles from './Heading.module.css';

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  size?: 1 | 2 | 3 | 4 | 5 | 6;
  as?: ElementType;
  children?: ReactNode;
}

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ size = 2, as, className, children, ...props }, ref) => {
    const Component = as || (`h${size}` as ElementType);
    
    return (
      <Component
        ref={ref}
        className={`${styles.heading} ${styles[`h${size}`]} ${className || ''}`}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Heading.displayName = 'Heading';
