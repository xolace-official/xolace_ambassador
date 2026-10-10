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
      // next-themes reads localStorage in preference to `defaultTheme`, and only
      // re-applies the class on a device change while the stored value is
      // "system". The default `theme` key still holds a pinned "light"/"dark"
      // for anyone who used the toggle before it was hidden, which is why
      // `defaultTheme="system"` alone does not bring them back to following the
      // device. A namespaced key orphans that value and leaves every visitor on
      // the device setting.
      storageKey="xolace-theme"
    >
      {children}
    </NextThemesProvider>
  );
}
