/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0B0F1A",
        secondary: "#9ca3af",
        accent1: "#3b82f6",
        accent2: "#a855f7",
      },
      fontFamily: {
        sans: ["sans-serif"],
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
