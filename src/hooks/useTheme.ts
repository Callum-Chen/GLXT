import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeConfig {
  bgPrimary: string;
  bgSecondary: string;
  textPrimary: string;
  textSecondary: string;
  borderColor: string;
  accentColor: string;
  successColor: string;
  warningColor: string;
  dangerColor: string;
  infoColor: string;
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Theme configuration
  const themeConfig: Record<Theme, ThemeConfig> = {
    light: {
      bgPrimary: 'bg-gray-50',
      bgSecondary: 'bg-white',
      textPrimary: 'text-gray-900',
      textSecondary: 'text-gray-600',
      borderColor: 'border-gray-200',
      accentColor: 'bg-blue-600',
      successColor: 'bg-green-500',
      warningColor: 'bg-yellow-500',
      dangerColor: 'bg-red-500',
      infoColor: 'bg-cyan-500',
    },
    dark: {
      bgPrimary: 'bg-gray-900',
      bgSecondary: 'bg-gray-800',
      textPrimary: 'text-gray-100',
      textSecondary: 'text-gray-300',
      borderColor: 'border-gray-700',
      accentColor: 'bg-blue-500',
      successColor: 'bg-green-500',
      warningColor: 'bg-yellow-500',
      dangerColor: 'bg-red-500',
      infoColor: 'bg-cyan-500',
    }
  };

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return {
    theme,
    toggleTheme,
    isDark: theme === 'dark',
    config: themeConfig[theme]
  };
} 