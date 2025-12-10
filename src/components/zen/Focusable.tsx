'use client';
import { forwardRef, HTMLAttributes, ReactNode } from 'react';

export interface FocusableProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export const Focusable = forwardRef<HTMLDivElement, FocusableProps>(
  ({ children, ...props }, ref) => {
    return (
      <div ref={ref} tabIndex={0} {...props}>
        {children}
      </div>
    );
  }
);

Focusable.displayName = 'Focusable';
