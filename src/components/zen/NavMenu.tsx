'use client';
import { forwardRef, HTMLAttributes, ReactNode } from 'react';
import styles from './NavMenu.module.css';

export interface NavMenuProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

export const NavMenu = forwardRef<HTMLElement, NavMenuProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <nav ref={ref} className={`${styles.nav} ${className || ''}`} {...props}>
        {children}
      </nav>
    );
  }
);

NavMenu.displayName = 'NavMenu';

export interface NavMenuItemProps extends HTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
  onAction?: () => void;
  children?: ReactNode;
}

export function NavMenuItem({ isActive, onAction, className, children, ...props }: NavMenuItemProps) {
  return (
    <button
      type="button"
      className={`${styles.item} ${isActive ? styles.active : ''} ${className || ''}`}
      onClick={onAction}
      {...props}
    >
      {children}
    </button>
  );
}
