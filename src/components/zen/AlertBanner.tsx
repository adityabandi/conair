'use client';
import { forwardRef, HTMLAttributes, ReactNode } from 'react';
import { Row } from './Layout';
import { Icon } from './Icon';
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import styles from './AlertBanner.module.css';

export interface AlertBannerProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'warning' | 'error' | 'info';
  onClose?: () => void;
  children?: ReactNode;
}

const icons = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
  info: Info,
};

export const AlertBanner = forwardRef<HTMLDivElement, AlertBannerProps>(
  ({ variant = 'info', onClose, className, children, ...props }, ref) => {
    const IconComponent = icons[variant];

    return (
      <div
        ref={ref}
        className={`${styles.banner} ${styles[variant]} ${className || ''}`}
        {...props}
      >
        <Row gap={12} alignItems="center" style={{ flex: 1 }}>
          <Icon size="sm">
            <IconComponent />
          </Icon>
          <span>{children}</span>
        </Row>
        {onClose && (
          <button className={styles.close} onClick={onClose}>
            <Icon size="sm">
              <X />
            </Icon>
          </button>
        )}
      </div>
    );
  }
);

AlertBanner.displayName = 'AlertBanner';
