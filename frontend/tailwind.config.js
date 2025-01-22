/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#FEFCE8",
        primary: "#3B82F6", // Royal Blue
        secondary: "#9333EA", // Purple
        accent: "#10B981", // Emerald Green
        darkText: "#111827", // Deep Charcoal Black
        lightText: "#6B7280", // Muted Gray
        borderColor: "#E5E7EB", // Light Gray
      },
    },
  },
  plugins: [],
};
