'use client';
import { forwardRef, ButtonHTMLAttributes, ReactNode, useState } from 'react';
import { Button, ButtonProps } from './Button';
import { Loading } from './Loading';

export interface LoadingButtonProps extends ButtonProps {
  isLoading?: boolean;
}

export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ isLoading, children, isDisabled, ...props }, ref) => {
    return (
      <Button ref={ref} isDisabled={isDisabled || isLoading} {...props}>
        {isLoading ? <Loading size="sm" /> : children}
      </Button>
    );
  }
);

LoadingButton.displayName = 'LoadingButton';
