'use client';
import { forwardRef, HTMLAttributes, ReactNode, useState, createContext, useContext, cloneElement, isValidElement } from 'react';
import { Modal } from './Modal';
import styles from './Dialog.module.css';

interface DialogContextValue {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}
const DialogContext = createContext<DialogContextValue>({ isOpen: false, onOpen: () => {}, onClose: () => {} });

export interface DialogTriggerProps {
  children: ReactNode;
}

export function DialogTrigger({ children }: DialogTriggerProps) {
  const { onOpen } = useContext(DialogContext);
  
  if (isValidElement(children)) {
    return cloneElement(children as React.ReactElement<any>, {
      onClick: (e: React.MouseEvent) => {
        (children as React.ReactElement<any>).props.onClick?.(e);
        onOpen();
      },
    });
  }
  
  return <span onClick={onOpen}>{children}</span>;
}

export interface DialogProps extends HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  variant?: 'default' | 'menu';
  children?: ReactNode;
}

export const Dialog = forwardRef<HTMLDivElement, DialogProps>(
  ({ isOpen: controlledIsOpen, onOpenChange, variant = 'default', className, children, ...props }, ref) => {
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const isOpen = controlledIsOpen ?? internalIsOpen;

    const onOpen = () => {
      setInternalIsOpen(true);
      onOpenChange?.(true);
    };

    const onClose = () => {
      setInternalIsOpen(false);
      onOpenChange?.(false);
    };

    // Separate trigger from content
    const triggerChild = Array.isArray(children) 
      ? children.find((child: any) => child?.type === DialogTrigger)
      : null;
    const contentChildren = Array.isArray(children)
      ? children.filter((child: any) => child?.type !== DialogTrigger)
      : children;

    return (
      <DialogContext.Provider value={{ isOpen, onOpen, onClose }}>
        {triggerChild}
        <Modal isOpen={isOpen} onClose={onClose}>
          <div
            ref={ref}
            className={`${styles.dialog} ${styles[variant]} ${className || ''}`}
            {...props}
          >
            {contentChildren}
          </div>
        </Modal>
      </DialogContext.Provider>
    );
  }
);

Dialog.displayName = 'Dialog';
