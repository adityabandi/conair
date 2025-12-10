'use client';
import { forwardRef, FormHTMLAttributes, ReactNode, createContext, useContext } from 'react';
import { Button } from './Button';
import { LoadingButton } from './LoadingButton';
import { Row } from './Layout';
import { Label } from './Label';
import styles from './Form.module.css';

// Form Context
interface FormContextValue {
  isSubmitting?: boolean;
}
const FormContext = createContext<FormContextValue>({});

export interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  onSubmit?: (data: any) => void | Promise<void>;
  children?: ReactNode;
}

export const Form = forwardRef<HTMLFormElement, FormProps>(
  ({ onSubmit, children, className, ...props }, ref) => {
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (onSubmit) {
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());
        await onSubmit(data);
      }
    };

    return (
      <form
        ref={ref}
        className={`${styles.form} ${className || ''}`}
        onSubmit={handleSubmit}
        {...props}
      >
        {children}
      </form>
    );
  }
);

Form.displayName = 'Form';

export interface FormFieldProps {
  label?: string;
  name?: string;
  error?: string;
  children?: ReactNode;
}

export function FormField({ label, name, error, children }: FormFieldProps) {
  return (
    <div className={styles.field}>
      {label && <Label htmlFor={name}>{label}</Label>}
      {children}
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}

export interface FormButtonsProps {
  children?: ReactNode;
  align?: 'left' | 'center' | 'right';
}

export function FormButtons({ children, align = 'right' }: FormButtonsProps) {
  return (
    <Row 
      className={styles.buttons} 
      gap={12} 
      justifyContent={align === 'left' ? 'flex-start' : align === 'center' ? 'center' : 'flex-end'}
    >
      {children}
    </Row>
  );
}

export interface FormSubmitButtonProps {
  isLoading?: boolean;
  isDisabled?: boolean;
  children?: ReactNode;
}

export function FormSubmitButton({ isLoading, isDisabled, children }: FormSubmitButtonProps) {
  return (
    <LoadingButton 
      type="submit" 
      variant="primary" 
      isLoading={isLoading} 
      isDisabled={isDisabled}
    >
      {children}
    </LoadingButton>
  );
}
