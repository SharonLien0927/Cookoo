/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#faf9f7',
          100: '#f5f3f0',
          200: '#e8e4dd',
          300: '#d4ccc0',
          400: '#b8a995',
          500: '#9d8a73',
          600: '#8a7560',
          700: '#72604f',
          800: '#5f5043',
          900: '#4f4339',
        },
        cream: {
          50: '#fefdfb',
          100: '#fdfbf6',
          200: '#faf6eb',
          300: '#f5eed8',
          400: '#ede0be',
          500: '#e3d0a0',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Noto Sans TC', 'San Francisco', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card': '0 4px 12px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}

