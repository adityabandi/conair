'use client';
import { forwardRef, HTMLAttributes, ReactNode, useState, useRef, createContext, useContext, cloneElement, isValidElement } from 'react';
import { createPortal } from 'react-dom';
import styles from './Menu.module.css';

interface MenuContextValue {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement>;
}
const MenuContext = createContext<MenuContextValue | null>(null);

export interface MenuTriggerProps {
  children: ReactNode;
}

export function MenuTrigger({ children }: MenuTriggerProps) {
  const context = useContext(MenuContext);
  const ref = useRef<HTMLElement>(null);

  if (!context) return <>{children}</>;

  if (isValidElement(children)) {
    return cloneElement(children as React.ReactElement<any>, {
      ref,
      onClick: (e: React.MouseEvent) => {
        (children as React.ReactElement<any>).props.onClick?.(e);
        context.onOpen();
        (context.triggerRef as any).current = ref.current;
      },
    });
  }

  return <span onClick={context.onOpen}>{children}</span>;
}

export interface MenuProps extends HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

export const Menu = forwardRef<HTMLDivElement, MenuProps>(
  ({ isOpen: controlledIsOpen, onOpenChange, className, children, ...props }, ref) => {
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const triggerRef = useRef<HTMLElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const isOpen = controlledIsOpen ?? internalIsOpen;

    const onOpen = () => {
      setInternalIsOpen(true);
      onOpenChange?.(true);
    };

    const onClose = () => {
      setInternalIsOpen(false);
      onOpenChange?.(false);
    };

    // Handle click outside
    React.useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(e.target as Node) &&
            triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
          onClose();
        }
      };
      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Calculate position
    const [position, setPosition] = React.useState({ top: 0, left: 0 });
    React.useEffect(() => {
      if (isOpen && triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setPosition({ top: rect.bottom + 4, left: rect.left });
      }
    }, [isOpen]);

    const trigger = React.Children.toArray(children).find(
      (child: any) => child?.type === MenuTrigger
    );
    const content = React.Children.toArray(children).filter(
      (child: any) => child?.type !== MenuTrigger
    );

    return (
      <MenuContext.Provider value={{ isOpen, onOpen, onClose, triggerRef }}>
        {trigger}
        {isOpen && createPortal(
          <div
            ref={menuRef}
            className={`${styles.menu} ${className || ''}`}
            style={{ top: position.top, left: position.left }}
            {...props}
          >
            {content}
          </div>,
          document.body
        )}
      </MenuContext.Provider>
    );
  }
);

Menu.displayName = 'Menu';

// Need to import React for the useEffect
import React from 'react';

export interface MenuItemProps extends HTMLAttributes<HTMLButtonElement> {
  onAction?: () => void;
  isDisabled?: boolean;
  children?: ReactNode;
}

export function MenuItem({ onAction, isDisabled, className, children, ...props }: MenuItemProps) {
  const context = useContext(MenuContext);

  const handleClick = () => {
    if (!isDisabled) {
      onAction?.();
      context?.onClose();
    }
  };

  return (
    <button
      type="button"
      className={`${styles.item} ${isDisabled ? styles.disabled : ''} ${className || ''}`}
      onClick={handleClick}
      disabled={isDisabled}
      {...props}
    >
      {children}
    </button>
  );
}

export function MenuSection({ children }: { children?: ReactNode }) {
  return <div className={styles.section}>{children}</div>;
}

export function MenuSeparator() {
  return <div className={styles.separator} />;
}

export function SubmenuTrigger({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}
