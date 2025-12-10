'use client';
import { ReactNode, createContext, useContext } from 'react';

interface ZenContextValue {
  theme?: 'light' | 'dark';
}

const ZenContext = createContext<ZenContextValue>({});

export interface ZenProviderProps {
  children?: ReactNode;
}

export function ZenProvider({ children }: ZenProviderProps) {
  return (
    <ZenContext.Provider value={{}}>
      {children}
    </ZenContext.Provider>
  );
}

export function useZen() {
  return useContext(ZenContext);
}
