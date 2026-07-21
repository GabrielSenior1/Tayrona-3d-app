/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        liquid: {
          dark: '#0a1628',
          card: 'rgba(15, 29, 53, 0.6)',
          border: 'rgba(107, 216, 203, 0.15)',
          primary: '#6bd8cb',
          text: '#c8d6e5',
          muted: '#8899aa',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'liquid': '0 8px 32px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
}
