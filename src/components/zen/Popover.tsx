'use client';
import { forwardRef, HTMLAttributes, ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './Popover.module.css';

export interface PopoverProps extends HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean;
  onClose?: () => void;
  anchorRef?: React.RefObject<HTMLElement>;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'bottom start' | 'bottom end';
  children?: ReactNode;
}

export const Popover = forwardRef<HTMLDivElement, PopoverProps>(
  ({ isOpen, onClose, anchorRef, placement = 'bottom', className, children, ...props }, ref) => {
    const popoverRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
      if (isOpen && anchorRef?.current && popoverRef.current) {
        const anchorRect = anchorRef.current.getBoundingClientRect();
        const popoverRect = popoverRef.current.getBoundingClientRect();
        
        let top = anchorRect.bottom + 4;
        let left = anchorRect.left;

        if (placement.includes('end')) {
          left = anchorRect.right - popoverRect.width;
        }

        setPosition({ top, left });
      }
    }, [isOpen, anchorRef, placement]);

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
          onClose?.();
        }
      };
      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
      <div
        ref={popoverRef}
        className={`${styles.popover} ${className || ''}`}
        style={{ top: position.top, left: position.left }}
        {...props}
      >
        {children}
      </div>,
      document.body
    );
  }
);

Popover.displayName = 'Popover';
