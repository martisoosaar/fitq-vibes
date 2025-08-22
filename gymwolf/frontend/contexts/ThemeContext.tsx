'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  isDarkMode: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Calculate if it's night time based on sunrise/sunset
function isNightTime(): boolean {
  const now = new Date();
  const hour = now.getHours();
  const month = now.getMonth();
  
  // Simple sunrise/sunset times for Estonia (can be adjusted)
  // Summer (May-August): sunrise ~5:00, sunset ~21:00
  // Winter (November-February): sunrise ~8:00, sunset ~16:00
  // Spring/Autumn: sunrise ~6:30, sunset ~19:00
  
  let sunrise, sunset;
  
  if (month >= 4 && month <= 7) { // May-August (summer)
    sunrise = 5;
    sunset = 21;
  } else if (month >= 10 || month <= 1) { // November-February (winter)
    sunrise = 8;
    sunset = 16;
  } else { // March-April, September-October
    sunrise = 6.5;
    sunset = 19;
  }
  
  return hour < sunrise || hour >= sunset;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Update dark mode based on theme mode
  useEffect(() => {
    if (!mounted) return;
    
    let dark = false;
    if (themeMode === 'dark') {
      dark = true;
    } else if (themeMode === 'auto') {
      dark = isNightTime();
    }
    
    setIsDarkMode(dark);
    
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode, mounted]);

  // Check auto mode every minute
  useEffect(() => {
    if (themeMode !== 'auto') return;
    
    const interval = setInterval(() => {
      const dark = isNightTime();
      setIsDarkMode(dark);
      
      if (dark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [themeMode]);

  useEffect(() => {
    setMounted(true);
    // Load theme preference from localStorage
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      const mode = settings.themeMode || 'light';
      setThemeModeState(mode);
    }
  }, []);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    
    // Save to localStorage
    const savedSettings = localStorage.getItem('userSettings');
    const settings = savedSettings ? JSON.parse(savedSettings) : {};
    settings.themeMode = mode;
    localStorage.setItem('userSettings', JSON.stringify(settings));
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, themeMode, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}