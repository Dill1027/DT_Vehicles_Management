/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        gray: {
          50: 'rgb(var(--fleet-gray-50) / <alpha-value>)',
          100: 'rgb(var(--fleet-gray-100) / <alpha-value>)',
          200: 'rgb(var(--fleet-gray-200) / <alpha-value>)',
          300: 'rgb(var(--fleet-gray-300) / <alpha-value>)',
          400: 'rgb(var(--fleet-gray-400) / <alpha-value>)',
          500: 'rgb(var(--fleet-gray-500) / <alpha-value>)',
          600: 'rgb(var(--fleet-gray-600) / <alpha-value>)',
          700: 'rgb(var(--fleet-gray-700) / <alpha-value>)',
          800: 'rgb(var(--fleet-gray-800) / <alpha-value>)',
          900: 'rgb(var(--fleet-gray-900) / <alpha-value>)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      }
    },
  },
  plugins: [],
}
