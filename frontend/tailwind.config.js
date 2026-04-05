/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E53E3E',
          50: '#FFF5F5',
          100: '#FED7D7',
          500: '#E53E3E',
          600: '#C53030',
          700: '#9B2C2C',
        },
        dark: {
          DEFAULT: '#1A1A2E',
          100: '#16213E',
          200: '#0F3460',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
