/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tesla: {
          red: '#E82127',
          'red-hover': '#FF2A30',
          'red-dark': '#B8151A',
          black: '#070709',
          dark: '#0C0C0F',
          card: '#121217',
          'card-hover': '#181820',
          gray: '#8E8E93',
          lightgray: '#D1D1D6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow-red': '0 0 25px rgba(232, 33, 39, 0.35)',
        'glow-green': '0 0 25px rgba(34, 197, 94, 0.35)',
        'card-subtle': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      spacing: {
        'space-1': '4px',
        'space-2': '8px',
        'space-3': '12px',
        'space-4': '16px',
        'space-6': '24px',
        'space-8': '32px',
        'space-12': '48px',
        'space-16': '64px',
      },
      borderRadius: {
        'radius-sm': '6px',
        'radius-md': '8px',
        'radius-lg': '12px',
        'radius-xl': '16px',
        'radius-full': '9999px',
      }
    },
  },
  plugins: [],
}
