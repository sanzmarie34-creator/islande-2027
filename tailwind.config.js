/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        glacier: { 50: '#f1f7f9', 100: '#dcebf0', 200: '#b9d7e1', 300: '#8fbdcd', 400: '#5f9db4', 500: '#41819a', 600: '#336880', 700: '#2c5569', 800: '#284858', 900: '#243d4b' },
        moss: { 50: '#f3f6ef', 100: '#e3ead9', 200: '#c8d6b5', 300: '#a5bb88', 400: '#829f61', 500: '#658345', 600: '#4e6735', 700: '#3e512c', 800: '#344227', 900: '#2d3923' },
        basalt: { 50: '#f5f6f6', 100: '#e6e7e8', 200: '#cfd1d3', 300: '#adb1b5', 400: '#84898f', 500: '#696e74', 600: '#5a5e63', 700: '#4c4f53', 800: '#2a2c2f', 900: '#17191b', 950: '#0e0f10' },
        lava: { 500: '#c2562b', 600: '#a8441f' },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
