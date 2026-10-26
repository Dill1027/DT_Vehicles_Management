import React from 'react';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../context/ThemeContext';
export default function ThemeToggle() {
  const { preference, setTheme } = useTheme();
  const Icon = preference === 'system' ? ComputerDesktopIcon : preference === 'dark' ? MoonIcon : SunIcon;
  return <label className="fleet-theme-control" title={`Colour theme: ${preference}`}>
    <Icon className="h-5 w-5" aria-hidden="true" />
    <span className="sr-only">Colour theme</span>
    <select aria-label="Colour theme" value={preference} onChange={event => setTheme(event.target.value)}>
      <option value="system">System theme</option><option value="light">Light theme</option><option value="dark">Dark theme</option>
    </select>
  </label>;
}
