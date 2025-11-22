'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors touch-manipulation"
      aria-label="Toggle dark mode"
    >
      {theme === 'dark' ? (
        <Sun size={18} className="text-gray-700 dark:text-gray-300" />
      ) : (
        <Moon size={18} className="text-gray-700 dark:text-gray-300" />
      )}
    </button>
  );
}

