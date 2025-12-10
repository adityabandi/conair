'use client';
import { forwardRef, InputHTMLAttributes, useState } from 'react';
import { Icon } from './Icon';
import { Search, X } from 'lucide-react';
import styles from './SearchField.module.css';

export interface SearchFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
  onClear?: () => void;
}

export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(
  ({ value, onChange, onClear, className, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value);
    };

    const handleClear = () => {
      onChange?.('');
      onClear?.();
    };

    return (
      <div className={`${styles.wrapper} ${className || ''}`}>
        <Icon size="sm" className={styles.searchIcon}>
          <Search />
        </Icon>
        <input
          ref={ref}
          type="text"
          className={styles.input}
          value={value}
          onChange={handleChange}
          {...props}
        />
        {value && (
          <button type="button" className={styles.clearButton} onClick={handleClear}>
            <Icon size="xs">
              <X />
            </Icon>
          </button>
        )}
      </div>
    );
  }
);

SearchField.displayName = 'SearchField';
