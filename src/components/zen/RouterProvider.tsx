'use client';
import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export interface RouterProviderProps {
  children?: ReactNode;
}

export function RouterProvider({ children }: RouterProviderProps) {
  // This is a passthrough - Next.js handles routing
  return <>{children}</>;
}
