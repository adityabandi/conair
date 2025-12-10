'use client';
import { Button } from './Button';
import { Icon } from './Icon';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './hooks/useTheme';

export function ThemeButton() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button variant="quiet" onPress={toggleTheme}>
      <Icon size="sm">
        {theme === 'dark' ? <Sun /> : <Moon />}
      </Icon>
    </Button>
  );
}
