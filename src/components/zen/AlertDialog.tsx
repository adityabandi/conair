'use client';
import { forwardRef, HTMLAttributes, ReactNode } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Row, Column } from './Layout';
import { Heading } from './Heading';
import { Text } from './Text';
import styles from './AlertDialog.module.css';

export interface AlertDialogProps extends HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean;
  onClose?: () => void;
  onConfirm?: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger';
}

export const AlertDialog = forwardRef<HTMLDivElement, AlertDialogProps>(
  ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = 'Are you sure?',
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'default',
    className, 
    ...props 
  }, ref) => {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <div ref={ref} className={`${styles.dialog} ${className || ''}`} {...props}>
          <Column gap={16}>
            <Column gap={8}>
              <Heading size={4}>{title}</Heading>
              {description && <Text color="muted">{description}</Text>}
            </Column>
            <Row gap={12} justifyContent="flex-end">
              <Button variant="quiet" onPress={onClose}>{cancelLabel}</Button>
              <Button variant={variant === 'danger' ? 'danger' : 'primary'} onPress={onConfirm}>
                {confirmLabel}
              </Button>
            </Row>
          </Column>
        </div>
      </Modal>
    );
  }
);

AlertDialog.displayName = 'AlertDialog';
