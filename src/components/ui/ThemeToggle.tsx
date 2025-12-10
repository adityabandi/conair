import React from 'react';
import { useTheme } from '@/components/hooks';
import { Moon, Sun } from '@/components/icons';
import styles from './ThemeToggle.module.css';

export function ThemeToggle() {
  const { theme, saveTheme } = useTheme();

  const toggleTheme = () => {
    saveTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <button className={styles.toggle} onClick={toggleTheme} aria-label="Toggle theme">
      {theme === 'light' ? <Moon /> : <Sun />}
    </button>
  );
}
