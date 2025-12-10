'use client';
import { forwardRef, HTMLAttributes, ReactNode, createContext, useContext, useState } from 'react';
import styles from './ToggleGroup.module.css';

interface ToggleGroupContextValue {
  value?: string;
  onChange?: (value: string) => void;
}
const ToggleGroupContext = createContext<ToggleGroupContextValue>({});

export interface ToggleGroupProps extends HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children?: ReactNode;
}

export const ToggleGroup = forwardRef<HTMLDivElement, ToggleGroupProps>(
  ({ value, defaultValue, onValueChange, className, children, ...props }, ref) => {
    const [internalValue, setInternalValue] = useState(defaultValue);
    const currentValue = value ?? internalValue;

    const handleChange = (newValue: string) => {
      setInternalValue(newValue);
      onValueChange?.(newValue);
    };

    return (
      <ToggleGroupContext.Provider value={{ value: currentValue, onChange: handleChange }}>
        <div ref={ref} className={`${styles.group} ${className || ''}`} role="group" {...props}>
          {children}
        </div>
      </ToggleGroupContext.Provider>
    );
  }
);

ToggleGroup.displayName = 'ToggleGroup';

export interface ToggleGroupItemProps extends HTMLAttributes<HTMLButtonElement> {
  value: string;
  children?: ReactNode;
}

export function ToggleGroupItem({ value, className, children, ...props }: ToggleGroupItemProps) {
  const { value: groupValue, onChange } = useContext(ToggleGroupContext);
  const isSelected = groupValue === value;

  return (
    <button
      type="button"
      className={`${styles.item} ${isSelected ? styles.selected : ''} ${className || ''}`}
      onClick={() => onChange?.(value)}
      data-state={isSelected ? 'on' : 'off'}
      {...props}
    >
      {children}
    </button>
  );
}
