'use client';
import { forwardRef, HTMLAttributes, ReactNode, createContext, useContext, useState } from 'react';
import styles from './Tabs.module.css';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (id: string) => void;
}
const TabsContext = createContext<TabsContextValue>({ activeTab: '', setActiveTab: () => {} });

export interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children?: ReactNode;
}

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  ({ defaultValue, value, onValueChange, className, children, ...props }, ref) => {
    const [internalValue, setInternalValue] = useState(defaultValue || '');
    const activeTab = value ?? internalValue;

    const setActiveTab = (id: string) => {
      setInternalValue(id);
      onValueChange?.(id);
    };

    return (
      <TabsContext.Provider value={{ activeTab, setActiveTab }}>
        <div ref={ref} className={`${styles.tabs} ${className || ''}`} {...props}>
          {children}
        </div>
      </TabsContext.Provider>
    );
  }
);

Tabs.displayName = 'Tabs';

export interface TabListProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export function TabList({ className, children, ...props }: TabListProps) {
  return (
    <div className={`${styles.tabList} ${className || ''}`} role="tablist" {...props}>
      {children}
    </div>
  );
}

export interface TabProps extends HTMLAttributes<HTMLButtonElement> {
  id: string;
  children?: ReactNode;
}

export function Tab({ id, className, children, ...props }: TabProps) {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  const isActive = activeTab === id;

  return (
    <button
      type="button"
      role="tab"
      className={`${styles.tab} ${isActive ? styles.active : ''} ${className || ''}`}
      onClick={() => setActiveTab(id)}
      aria-selected={isActive}
      {...props}
    >
      {children}
    </button>
  );
}

export interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
  id: string;
  children?: ReactNode;
}

export function TabPanel({ id, className, children, ...props }: TabPanelProps) {
  const { activeTab } = useContext(TabsContext);
  
  if (activeTab !== id) return null;

  return (
    <div role="tabpanel" className={`${styles.panel} ${className || ''}`} {...props}>
      {children}
    </div>
  );
}
