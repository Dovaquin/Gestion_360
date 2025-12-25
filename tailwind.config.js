/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#13ec5b",
        "primary-dark": "#0fb946",
        "background-light": "#f6f8f6",
        "background-dark": "#102216",
        "surface-dark": "#1a3825",
        "surface-light": "#ffffff",
      },
      fontFamily: {
        display: ["Manrope", "sans-serif"],
      },
      screens: {
        'safe-pb': { 'raw': '(padding-bottom: env(safe-area-inset-bottom))' },
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
}