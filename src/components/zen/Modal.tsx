'use client';
import { forwardRef, HTMLAttributes, ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.css';

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean;
  onClose?: () => void;
  children?: ReactNode;
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ isOpen, onClose, className, children, ...props }, ref) => {
    const backdropRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      }
      return () => {
        document.body.style.overflow = '';
      };
    }, [isOpen]);

    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && onClose) onClose();
      };
      if (isOpen) {
        document.addEventListener('keydown', handleEscape);
      }
      return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    const handleBackdropClick = (e: React.MouseEvent) => {
      if (e.target === backdropRef.current && onClose) onClose();
    };

    if (!isOpen) return null;

    return createPortal(
      <div
        ref={backdropRef}
        className={styles.backdrop}
        onClick={handleBackdropClick}
      >
        <div
          ref={ref}
          className={`${styles.modal} ${className || ''}`}
          role="dialog"
          aria-modal="true"
          {...props}
        >
          {children}
        </div>
      </div>,
      document.body
    );
  }
);

Modal.displayName = 'Modal';
