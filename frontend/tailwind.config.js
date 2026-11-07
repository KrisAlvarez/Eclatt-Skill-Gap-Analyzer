/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f3f7f4',
          100: '#e4efe7',
          200: '#c9dfd1',
          300: '#9fc5ad',
          400: '#6ea684',
          500: '#488762',
          600: '#366d4e',
          700: '#2c573f',
          800: '#254634',
          900: '#1b3729',
          950: '#0f2017',
        },
        sage: {
          50: '#f6f8f5',
          100: '#edf1ea',
          200: '#dde4d7',
          300: '#c4d1bc',
          400: '#a3b798',
          500: '#829c76',
          600: '#647d5a',
          700: '#4f6347',
          800: '#40503a',
          900: '#364332',
        }
      },
      fontFamily: {
        editorial: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
