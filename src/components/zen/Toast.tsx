'use client';

import { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';
import styles from './Toast.module.css';

// Toast Types
export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  message: string;
  variant?: ToastVariant;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface Toast extends ToastOptions {
  id: string;
}

// Context
interface ToastContextValue {
  toast: (message: string | ToastOptions) => string;
  success: (message: string) => string;
  error: (message: string) => string;
  warning: (message: string) => string;
  info: (message: string) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// Provider
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const addToast = useCallback((options: ToastOptions): string => {
    const id = String(++idRef.current);
    const newToast: Toast = { id, duration: 4000, variant: 'info', ...options };

    setToasts(prev => [...prev, newToast]);

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, newToast.duration);
    }

    return id;
  }, []);

  const toast = useCallback((messageOrOptions: string | ToastOptions): string => {
    if (typeof messageOrOptions === 'string') {
      return addToast({ message: messageOrOptions });
    }
    return addToast(messageOrOptions);
  }, [addToast]);

  const success = useCallback((message: string) => addToast({ message, variant: 'success' }), [addToast]);
  const error = useCallback((message: string) => addToast({ message, variant: 'error' }), [addToast]);
  const warning = useCallback((message: string) => addToast({ message, variant: 'warning' }), [addToast]);
  const info = useCallback((message: string) => addToast({ message, variant: 'info' }), [addToast]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info, dismiss, dismissAll }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

// Hook
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    // Return a no-op implementation if not in provider
    return {
      toast: () => '',
      success: () => '',
      error: () => '',
      warning: () => '',
      info: () => '',
      dismiss: () => {},
      dismissAll: () => {},
    };
  }
  return context;
}

// Toast Container
function ToastContainer({
  toasts,
  onDismiss
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className={styles.container}>
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
}

// Toast Item
function ToastItem({
  toast,
  onDismiss
}: {
  toast: Toast;
  onDismiss: () => void;
}) {
  const icons: Record<ToastVariant, string> = {
    success: '✓',
    error: '✕',
    warning: '!',
    info: 'i',
  };

  return (
    <div className={`${styles.toast} ${styles[toast.variant || 'info']}`}>
      <span className={styles.icon}>{icons[toast.variant || 'info']}</span>
      <span className={styles.message}>{toast.message}</span>
      {toast.action && (
        <button className={styles.action} onClick={toast.action.onClick}>
          {toast.action.label}
        </button>
      )}
      <button className={styles.close} onClick={onDismiss}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
}
