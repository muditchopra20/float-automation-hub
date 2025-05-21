
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Add theme transition effect
  React.useEffect(() => {
    const handleThemeChange = () => {
      document.documentElement.classList.add('transitioning');
      
      setTimeout(() => {
        document.documentElement.classList.remove('transitioning');
      }, 200);
    };

    // Listen for theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handleThemeChange);

    return () => {
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', handleThemeChange);
    };
  }, []);

  return (
    <NextThemesProvider {...props}>
      {children}
    </NextThemesProvider>
  );
}
