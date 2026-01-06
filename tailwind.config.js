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
          50: '#f0f1ff',
          100: '#e4e6ff',
          200: '#cdcfff',
          300: '#a8abff',
          400: '#8183ff',
          500: '#667eea',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        secondary: {
          500: '#764ba2',
          600: '#663d8a',
        },
        dark: {
          50: '#f8fafc',
          100: '#e4e4e4',
          200: '#a8b2d1',
          300: '#8892b0',
          400: '#5a6380',
          500: '#1a1a2e',
          600: '#16213e',
          700: '#0f0f1a',
          800: '#0a0a12',
          900: '#050508',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      animation: {
        'message-in': 'messageIn 0.3s ease',
        'spin-slow': 'spin 1s linear infinite',
      },
      keyframes: {
        messageIn: {
          from: { opacity: 0, transform: 'translateY(10px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
