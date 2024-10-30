import React, { createContext, useContext, useState } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { Theme } from './types/types';
import { lightTheme } from './themes/default';
import { darkTheme } from './themes/dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setActiveTheme] = useState<Theme>(darkTheme);

  const setTheme = (mode: 'light' | 'dark') => {
    setActiveTheme(mode === 'light' ? lightTheme : darkTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <StyledThemeProvider theme={theme}>
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};