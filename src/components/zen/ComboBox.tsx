'use client';
import { forwardRef, InputHTMLAttributes, useState, useRef, useEffect } from 'react';
import { TextField } from './TextField';
import { Column } from './Layout';
import styles from './ComboBox.module.css';

export interface ComboBoxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  items?: { value: string; label: string }[];
  value?: string;
  onChange?: (value: string) => void;
  onSelectionChange?: (value: string) => void;
}

export const ComboBox = forwardRef<HTMLInputElement, ComboBoxProps>(
  ({ items = [], value, onChange, onSelectionChange, className, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState(value || '');
    const wrapperRef = useRef<HTMLDivElement>(null);

    const filtered = items.filter(item =>
      item.label.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (item: { value: string; label: string }) => {
      setSearch(item.label);
      onChange?.(item.value);
      onSelectionChange?.(item.value);
      setIsOpen(false);
    };

    return (
      <div ref={wrapperRef} className={`${styles.wrapper} ${className || ''}`}>
        <TextField
          ref={ref}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          {...props}
        />
        {isOpen && filtered.length > 0 && (
          <Column className={styles.dropdown}>
            {filtered.map((item) => (
              <button
                key={item.value}
                type="button"
                className={styles.option}
                onClick={() => handleSelect(item)}
              >
                {item.label}
              </button>
            ))}
          </Column>
        )}
      </div>
    );
  }
);

ComboBox.displayName = 'ComboBox';
