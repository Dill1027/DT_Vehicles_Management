import React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ThemeProvider } from './ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
let listeners;
beforeEach(() => {
  localStorage.clear(); listeners = [];
  window.matchMedia = jest.fn(() => ({ matches: false, addEventListener: (name, listener) => listeners.push(listener), removeEventListener: jest.fn() }));
  document.documentElement.removeAttribute('data-theme');
});
afterEach(() => { cleanup(); jest.restoreAllMocks(); });
const show = () => render(<ThemeProvider><ThemeToggle /></ThemeProvider>);
test('manual choice updates the page and persists across remounts', () => {
  const first = show();
  fireEvent.change(screen.getByRole('combobox', { name: 'Colour theme' }), { target: { value: 'dark' } });
  expect(document.documentElement.dataset.theme).toBe('dark');
  expect(document.documentElement.style.colorScheme).toBe('dark');
  expect(document.documentElement.classList.contains('dark')).toBe(true);
  expect(localStorage.getItem('dt_fleet_theme')).toBe('dark');
  first.unmount(); show();
  expect(document.documentElement.dataset.theme).toBe('dark');
  expect(screen.getByRole('combobox').value).toBe('dark');
});
test('system theme follows OS changes while explicit light stays light', () => {
  show();
  act(() => listeners[0]({ matches: true }));
  expect(document.documentElement.dataset.theme).toBe('dark');
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'light' } });
  act(() => listeners[0]({ matches: true }));
  expect(document.documentElement.dataset.theme).toBe('light');
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'system' } });
  expect(document.documentElement.dataset.theme).toBe('dark');
});
test('changes made in another tab synchronize', () => {
  show();
  act(() => window.dispatchEvent(new StorageEvent('storage', { key: 'dt_fleet_theme', newValue: 'dark' })));
  expect(screen.getByRole('combobox').value).toBe('dark');
  expect(document.documentElement.dataset.theme).toBe('dark');
});
test('theme controls remain usable when storage is blocked', () => {
  jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('Storage unavailable'); });
  jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Storage unavailable'); });
  show();
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'dark' } });
  expect(document.documentElement.dataset.theme).toBe('dark');
});
