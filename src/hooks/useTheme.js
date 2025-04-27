// hooks/useTheme.js
import { ThemeContext } from '@/app/layout';
import { useContext } from 'react';

export function useTheme() {

  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;

}



