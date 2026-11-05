import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  subText: string;
  border: string;
  primary: string;
  primaryDark: string;
  accent: string;
  inputBackground: string;
  inputBg: string;
  statusBar: 'light' | 'dark';
}

const lightColors: ThemeColors = {
  background: '#FFFFFF',
  surface: '#F8FAFC',
  card: '#FFFFFF',
  text: '#1F2937',
  textSecondary: '#6B7280',
  subText: '#6B7280',
  border: '#E5E7EB',
  primary: '#0D9488',
  primaryDark: '#0F766E',
  accent: '#F59E0B',
  inputBackground: '#F3F4F6',
  inputBg: '#F3F4F6',
  statusBar: 'dark',
};

const darkColors: ThemeColors = {
  background: '#0F172A',      // Slate 900
  surface: '#1E293B',         // Slate 800
  card: '#1E293B',            // Slate 800
  text: '#F8FAFC',            // Slate 50
  textSecondary: '#94A3B8',   // Slate 400
  subText: '#94A3B8',
  border: '#334155',          // Slate 700
  primary: '#14B8A6',         // Teal 500
  primaryDark: '#0D9488',     // Teal 600
  accent: '#FBBF24',          // Amber 400
  inputBackground: '#334155', // Slate 700
  inputBg: '#334155',
  statusBar: 'light',
};

export interface ThemeContextType {
  isDarkMode: boolean;
  isDark: boolean;
  theme: ThemeMode;
  toggleTheme: () => void;
  colors: ThemeColors;
}

const THEME_STORAGE_KEY = '@travelling_app_theme_mode';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeMode>('light');

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((stored) => {
      if (stored === 'dark' || stored === 'light') {
        setTheme(stored);
      }
    }).catch(() => {});
  }, []);

  const toggleTheme = async () => {
    const nextTheme: ThemeMode = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {}
  };

  const isDarkMode = theme === 'dark';
  const colors = isDarkMode ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDarkMode, isDark: isDarkMode, theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
