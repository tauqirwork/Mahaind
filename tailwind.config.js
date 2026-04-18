/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#00668B",
        "secondary": "#FF6B00",
        "tertiary": "#2E7D32",
        "on-primary": "#ffffff",
        "background": "#F8FAFC",
        "surface": "#ffffff",
        "outline": "#94A3B8",
        "surface-container": "#F1F5F9",
        "surface-container-high": "#E2E8F0"
      },
      fontFamily: {
        "headline": ["Space Grotesk", "sans-serif"],
        "body": ["Inter", "sans-serif"],
        "label": ["Inter", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "4px",
        "lg": "8px",
        "xl": "12px",
        "full": "9999px"
      }
    },
  },
  plugins: [],
}
