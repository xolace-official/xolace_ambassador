"use client";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// No manual toggle: the theme follows the device, so it tracks the OS setting
// live rather than being pinned to one value at build time.
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
