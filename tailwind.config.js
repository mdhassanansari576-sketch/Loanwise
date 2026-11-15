/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        fintech: {
          blue: '#2563EB',
          indigo: '#4F46E5',
          navy: '#0F172A',
          darkBg: '#0B0F19',
          darkCard: '#131B2E',
          emerald: '#10B981',
          cyan: '#06B6D4',
        }
      }
    },
  },
  plugins: [],
}
