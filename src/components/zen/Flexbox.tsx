'use client';
import { forwardRef, HTMLAttributes, CSSProperties, ReactNode } from 'react';

export interface FlexboxProps extends HTMLAttributes<HTMLDivElement> {
  direction?: CSSProperties['flexDirection'];
  gap?: string | number;
  alignItems?: CSSProperties['alignItems'];
  justifyContent?: CSSProperties['justifyContent'];
  wrap?: CSSProperties['flexWrap'];
  children?: ReactNode;
}

export const Flexbox = forwardRef<HTMLDivElement, FlexboxProps>(
  ({ direction = 'row', gap, alignItems, justifyContent, wrap, style, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          display: 'flex',
          flexDirection: direction,
          gap: typeof gap === 'number' ? `${gap}px` : gap,
          alignItems,
          justifyContent,
          flexWrap: wrap,
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Flexbox.displayName = 'Flexbox';
