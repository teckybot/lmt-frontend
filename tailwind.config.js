/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // ⬅️ this is required for dark mode support
  theme: {
    extend: {},
  },
  plugins: [],
}
