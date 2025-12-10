'use client';
import { forwardRef, HTMLAttributes, ReactNode, useState, useRef, cloneElement, isValidElement } from 'react';
import styles from './Tooltip.module.css';

export interface TooltipProps {
  content: ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  children: ReactNode;
}

export function Tooltip({ content, placement = 'top', children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const triggerRef = useRef<HTMLElement>(null);

  const handleMouseEnter = () => setIsVisible(true);
  const handleMouseLeave = () => setIsVisible(false);

  return (
    <span 
      className={styles.wrapper}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <span className={`${styles.tooltip} ${styles[placement]}`}>
          {content}
        </span>
      )}
    </span>
  );
}

export interface TooltipTriggerProps {
  children: ReactNode;
}

export function TooltipTrigger({ children }: TooltipTriggerProps) {
  return <>{children}</>;
}

export interface FloatingTooltipProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export const FloatingTooltip = forwardRef<HTMLDivElement, FloatingTooltipProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={`${styles.floating} ${className || ''}`} {...props}>
        {children}
      </div>
    );
  }
);

FloatingTooltip.displayName = 'FloatingTooltip';
