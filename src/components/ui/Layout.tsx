import React, { HTMLAttributes } from 'react';
import classNames from 'classnames';
import styles from './Layout.module.css';

interface FlexProps extends HTMLAttributes<HTMLDivElement> {
  gap?: '1' | '2' | '3' | '4' | '5' | '6' | '8' | '10' | '12';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  padding?: '4' | '6' | '8' | '12';
}

export const Row = React.forwardRef<HTMLDivElement, FlexProps>(
  ({ className, gap, alignItems, justifyContent, padding, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={classNames(
          styles.flex,
          styles.row,
          gap && styles[`gap-${gap}`],
          padding && styles[`p-${padding}`],
          className
        )}
        style={{ alignItems, justifyContent, ...style }}
        {...props}
      />
    );
  }
);

Row.displayName = 'Row';

export const Column = React.forwardRef<HTMLDivElement, FlexProps>(
  ({ className, gap, alignItems, justifyContent, padding, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={classNames(
          styles.flex,
          styles.column,
          gap && styles[`gap-${gap}`],
          padding && styles[`p-${padding}`],
          className
        )}
        style={{ alignItems, justifyContent, ...style }}
        {...props}
      />
    );
  }
);

Column.displayName = 'Column';
