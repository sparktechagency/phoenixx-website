"use client";
import "./globals.css";
import Navbar from "@/components/Navber";
import { usePathname } from "next/navigation";
import { Provider } from "react-redux";
import { store } from "../../utils/store";
import { ConfigProvider, theme } from "antd";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { createContext, useState, useEffect } from 'react';
import { Toaster } from "react-hot-toast";

// Create Theme Context
export const ThemeContext = createContext();

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith('/auth');

  // Theme state management
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newTheme);
  };

  // Prevent rendering with wrong theme
  if (!mounted) {
    return null;
  }

  // Light theme tokens
  const lightThemeTokens = {
    colorPrimary: '#0001FB',
    colorBorder: '#E5E4E2',
    colorText: 'rgba(0, 0, 0, 0.88)',
    colorTextPlaceholder: '#bfbfbf',
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f5f5f5',
    colorBgElevated: '#ffffff',
    controlOutline: 'rgba(232, 80, 91, 0.1)',
    borderRadius: 6,
  };

  // Dark theme tokens
  const darkThemeTokens = {
    colorPrimary: '#4E4EFB',
    colorBorder: '#424242',
    colorText: 'rgba(255, 255, 255, 0.85)',
    colorTextPlaceholder: '#737373',
    colorBgContainer: '#1a1a1a',
    colorBgLayout: '#000000',
    colorBgElevated: '#1f1f1f',
    controlOutline: 'rgba(232, 80, 91, 0.1)',
    borderRadius: 6,
  };

  // Component-specific overrides
  const componentOverrides = {
    Layout: {
      headerBg: isDarkMode ? '#141414' : '#ffffff',
      bodyBg: isDarkMode ? '#1a1a1a' : '#ffffff',
      siderBg: isDarkMode ? '#141414' : '#ffffff',
    },
    Menu: {
      itemBg: isDarkMode ? '#141414' : '#ffffff',
      itemSelectedBg: isDarkMode ? '#4E4EFB' : '#0001FB',
      itemSelectedColor: isDarkMode ? '#ffffff' : '#ffffff',
      itemHoverBg: isDarkMode ? '#2a2a2a' : '#f0f0f0',
    },
    Table: {
      headerBg: isDarkMode ? '#1f1f1f' : '#fafafa',
      headerColor: isDarkMode ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.88)',
      rowHoverBg: isDarkMode ? '#2a2a2a' : '#fafafa',
    },
    Card: {
      colorBgContainer: isDarkMode ? '#1f1f1f' : '#ffffff',
    },
    Input: {
      colorBgContainer: isDarkMode ? '#1f1f1f' : '#ffffff',
    },
    Select: {
      colorBgContainer: isDarkMode ? '#1f1f1f' : '#ffffff',
      optionSelectedBg: isDarkMode ? '#2a2a2a' : '#f5f5f5',
    },
    Modal: {
      contentBg: isDarkMode ? '#1f1f1f' : '#ffffff',
      headerBg: isDarkMode ? '#1f1f1f' : '#ffffff',
    },
    Drawer: {
      colorBgElevated: isDarkMode ? '#1f1f1f' : '#ffffff',
    },
  };

  return (
    <html lang="en" className={isDarkMode ? 'dark' : ''}>
      <body
        className={`antialiased ${isDarkMode ? 'dark' : 'light'}`}
        cz-shortcut-listen="true"
      >
        <AntdRegistry>
          <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            <ConfigProvider
              theme={{
                algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
                token: isDarkMode ? darkThemeTokens : lightThemeTokens,
                components: componentOverrides,
              }}
            >
              <Provider store={store}>
                {!isAuthPage && <Navbar />}
                {children}
                <Toaster
                  position="top-center"
                  reverseOrder={false}
                />
              </Provider>
            </ConfigProvider>
          </ThemeContext.Provider>
        </AntdRegistry>
      </body>
    </html>
  );
}