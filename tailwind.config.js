/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      keyframes: {
        progress: {
          "0%": { width: "0%" },
          "100%": { width: "100%" },
        },
      },
      animation: {
        progress: "progress 2s ease-in-out infinite",
      },
      spacing: {
        base: "0.25rem",
        lg: "1.5rem",
        sm: "0.5rem",
        md: "1rem",
        xl: "2.5rem",
        gutter: "1.25rem",
        xxl: "4rem",
        xs: "0.25rem",
      },
    },
  },
  plugins: [],
}
