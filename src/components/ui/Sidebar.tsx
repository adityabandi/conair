import React, { HTMLAttributes } from 'react';
import classNames from 'classnames';
import styles from './Sidebar.module.css';

interface SidebarProps extends HTMLAttributes<HTMLDivElement> {
  isCollapsed?: boolean;
}

export const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, isCollapsed, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={classNames(styles.sidebar, { [styles.collapsed]: isCollapsed }, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Sidebar.displayName = 'Sidebar';

export const SidebarSection = React.forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={classNames(styles.section, className)} {...props}>
        {children}
      </div>
    );
  }
);
SidebarSection.displayName = 'SidebarSection';

interface SidebarItemProps extends HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  label: string;
  isSelected?: boolean;
}

export const SidebarItem = React.forwardRef<HTMLDivElement, SidebarItemProps>(
  ({ className, icon, label, isSelected, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={classNames(styles.item, { [styles.selected]: isSelected }, className)}
        {...props}
      >
        {icon && <span className={styles.icon}>{icon}</span>}
        <span>{label}</span>
      </div>
    );
  }
);
SidebarItem.displayName = 'SidebarItem';

interface SidebarHeaderProps extends HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  label: string;
}

export const SidebarHeader = React.forwardRef<HTMLDivElement, SidebarHeaderProps>(
  ({ className, icon, label, children, ...props }, ref) => {
    return (
      <div ref={ref} className={classNames(styles.header, className)} {...props}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <span>{label}</span>
        {children}
      </div>
    );
  }
);
SidebarHeader.displayName = 'SidebarHeader';
