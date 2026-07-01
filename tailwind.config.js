/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fbf6e8',
          100: '#f5e8c9',
          200: '#ebd19a',
          300: '#e0ba6b',
          400: '#d6a33c',
          500: '#c9a84c',
          600: '#b8943a',
          700: '#a07d30',
          800: '#886626',
          900: '#704f1c',
        }
      }
    },
  },
  plugins: [],
}