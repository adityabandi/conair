'use client';
import { forwardRef, HTMLAttributes, CSSProperties, ReactNode } from 'react';

export interface BoxProps extends HTMLAttributes<HTMLDivElement> {
  padding?: string | number;
  margin?: string | number;
  children?: ReactNode;
}

export const Box = forwardRef<HTMLDivElement, BoxProps>(
  ({ padding, margin, style, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          padding: typeof padding === 'number' ? `${padding}px` : padding,
          margin: typeof margin === 'number' ? `${margin}px` : margin,
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Box.displayName = 'Box';
