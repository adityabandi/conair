import { useState, useEffect } from 'react';
import { getItem, setItem } from '@/lib/storage';

const THEME_KEY = 'convertair-theme';

export function useTheme() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const storedTheme = getItem(THEME_KEY) || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(storedTheme);
    document.documentElement.setAttribute('data-theme', storedTheme);
  }, []);

  const saveTheme = (value: string) => {
    setTheme(value);
    setItem(THEME_KEY, value);
    document.documentElement.setAttribute('data-theme', value);
  };

  return { theme, saveTheme };
}
