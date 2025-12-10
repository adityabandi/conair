'use client';
import { forwardRef, HTMLAttributes, ReactNode } from 'react';
import styles from './List.module.css';

export interface ListProps extends HTMLAttributes<HTMLUListElement> {
  children?: ReactNode;
}

export const List = forwardRef<HTMLUListElement, ListProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <ul ref={ref} className={`${styles.list} ${className || ''}`} {...props}>
        {children}
      </ul>
    );
  }
);

List.displayName = 'List';

export interface ListItemProps extends HTMLAttributes<HTMLLIElement> {
  children?: ReactNode;
}

export function ListItem({ className, children, ...props }: ListItemProps) {
  return (
    <li className={`${styles.item} ${className || ''}`} {...props}>
      {children}
    </li>
  );
}

export function ListSeparator() {
  return <li className={styles.separator} role="separator" />;
}
