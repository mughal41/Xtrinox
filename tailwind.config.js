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
        base: "4px",
        lg: "24px",
        sm: "8px",
        md: "16px",
        xl: "40px",
        gutter: "20px",
        xxl: "64px",
        xs: "4px",
      },
    },
  },
  plugins: [],
}
