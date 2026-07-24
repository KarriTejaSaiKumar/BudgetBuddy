import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('budgetbuddy_theme_mode') || 'dark';
  });

  const [activeTheme, setActiveTheme] = useState('dark');

  useEffect(() => {
    localStorage.setItem('budgetbuddy_theme_mode', themeMode);
    
    const applyTheme = () => {
      let resolvedTheme = themeMode;
      if (themeMode === 'system') {
        resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }

      setActiveTheme(resolvedTheme);
      const root = document.documentElement;
      
      if (resolvedTheme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
      }
    };

    applyTheme();

    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = (e) => {
        const resolvedTheme = e.matches ? 'dark' : 'light';
        setActiveTheme(resolvedTheme);
        const root = document.documentElement;
        if (resolvedTheme === 'dark') {
          root.classList.add('dark');
          root.classList.remove('light');
        } else {
          root.classList.add('light');
          root.classList.remove('dark');
        }
      };
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, activeTheme, toggleTheme }}>
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
