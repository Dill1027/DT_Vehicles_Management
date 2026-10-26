import React, { createContext, useContext, useEffect, useLayoutEffect, useState } from 'react';
const STORAGE_KEY = 'dt_fleet_theme';
const choices = ['light', 'dark', 'system'];
const ThemeContext = createContext(null);
const prefersDark = () => Boolean(window.matchMedia?.('(prefers-color-scheme: dark)').matches);
function storedTheme() {
  try { const value = localStorage.getItem(STORAGE_KEY); return choices.includes(value) ? value : 'system'; }
  catch { return 'system'; }
}
export function ThemeProvider({ children }) {
  const [preference, setPreference] = useState(storedTheme);
  const [systemDark, setSystemDark] = useState(prefersDark);
  const theme = preference === 'system' ? systemDark ? 'dark' : 'light' : preference;
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.classList.toggle('dark', theme === 'dark');
    root.dataset.themePreference = preference;
    root.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#111c2f' : '#ffffff');
  }, [theme, preference]);
  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    const change = event => setSystemDark(event.matches);
    if (media?.addEventListener) media.addEventListener('change', change);
    else media?.addListener?.(change);
    const sync = event => { if (event.key === STORAGE_KEY || event.key === null) setPreference(choices.includes(event.newValue) ? event.newValue : 'system'); };
    window.addEventListener('storage', sync);
    return () => {
      if (media?.removeEventListener) media.removeEventListener('change', change);
      else media?.removeListener?.(change);
      window.removeEventListener('storage', sync);
    };
  }, []);
  const setTheme = value => {
    if (!choices.includes(value)) return;
    setPreference(value);
    try { localStorage.setItem(STORAGE_KEY, value); } catch { /* Theme still works when browser storage is unavailable. */ }
  };
  return <ThemeContext.Provider value={{ theme, preference, setTheme }}>{children}</ThemeContext.Provider>;
}
export const useTheme = () => useContext(ThemeContext);
