/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4fbf3',
          100: '#cff0cc',
          200: '#60cc56',
          300: '#4abd3f',
          400: '#40b236',
          500: '#3aa630',
          600: '#318929',
          700: '#276e22',
          800: '#1c4e18',
          900: '#143a12',
        },
        neutralfitq: {
          0: '#ffffff',
          50: '#f5f7f9',
          100: '#eceff2',
          200: '#d7dbe0',
          400: '#9aa3ad',
          600: '#5a6673',
          650: '#424a55',
          800: '#2c313a',
        },
      },
      borderRadius: {
        xl: '0.875rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
      },
      fontFamily: {
        sans: [
          'Albert Sans',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};

