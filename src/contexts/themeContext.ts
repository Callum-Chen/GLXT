/* 
 * 主题上下文
 * 提供应用程序主题管理，支持明暗主题切换
 * 允许应用程序各组件访问和修改主题设置
 */
import { createContext } from "react";

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

interface ThemeContextType {
  theme: 'light' | 'dark';
  isDark: boolean;
  toggleTheme: () => void;
  config: ThemeConfig;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  isDark: false,
  toggleTheme: () => {},
  config: {
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
  }
});