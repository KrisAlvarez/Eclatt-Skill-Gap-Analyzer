/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Lora', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        forest: {
          50: '#f2f7f2',
          100: '#e1ede0',
          200: '#c5dbc3',
          300: '#9ec19b',
          400: '#75a371',
          500: '#52854e',
          600: '#3d693a',
          700: '#30532e',
          800: '#274326',
          900: '#1d321d',
          950: '#0e1c0e',
        },
      },
    },
  },
  plugins: [],
}
