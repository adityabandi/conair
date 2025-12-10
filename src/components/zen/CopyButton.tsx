'use client';
import { forwardRef, ButtonHTMLAttributes, useState } from 'react';
import { Button } from './Button';
import { Icon } from './Icon';
import { Check, Copy } from 'lucide-react';
import styles from './CopyButton.module.css';

export interface CopyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export const CopyButton = forwardRef<HTMLButtonElement, CopyButtonProps>(
  ({ value, className, ...props }, ref) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <Button
        ref={ref}
        variant="quiet"
        size="sm"
        className={`${styles.copyButton} ${className || ''}`}
        onPress={handleCopy}
        {...props}
      >
        <Icon size="sm">
          {copied ? <Check /> : <Copy />}
        </Icon>
      </Button>
    );
  }
);

CopyButton.displayName = 'CopyButton';
