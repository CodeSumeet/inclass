/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: "#eef6ff",
          100: "#d9eaff",
          200: "#bcd9ff",
          300: "#8ec2ff",
          400: "#589fff",
          500: "#3b82f6",
          600: "#2570eb",
          700: "#1d5fc2",
          800: "#1a4c98",
          900: "#193f7c",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          50: "#fbf1ff",
          100: "#f6e4ff",
          200: "#edc9ff",
          300: "#e19fff",
          400: "#cb65ff",
          500: "#a855f7",
          600: "#9333ea",
          700: "#7c22ce",
          800: "#6821a8",
          900: "#541c87",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          50: "#e8faf4",
          100: "#d1f4e8",
          200: "#a3e9d2",
          300: "#6bd4b4",
          400: "#34c496",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
        success: {
          DEFAULT: "#22c55e",
          foreground: "#ffffff",
        },
        warning: {
          DEFAULT: "#f59e0b",
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        border: "hsl(var(--border))",
        ring: "hsl(var(--ring))",
        chalk: {
          DEFAULT: "#ffffff",
          dark: "#f8fafc",
        },
        pencil: {
          DEFAULT: "#374151",
          light: "#6b7280",
        },
      },
      borderRadius: {
        sm: "0.375rem",
        DEFAULT: "0.5rem",
        md: "0.625rem",
        lg: "0.75rem",
        xl: "1rem",
      },
      animation: {
        "collapsible-down": "collapsibleDown 300ms ease-out",
        "collapsible-up": "collapsibleUp 300ms ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-gentle": "bounceGentle 2s ease-in-out infinite",
      },
      keyframes: {
        collapsibleDown: {
          from: { height: 0 },
          to: { height: "var(--radix-collapsible-content-height)" },
        },
        collapsibleUp: {
          from: { height: "var(--radix-collapsible-content-height)" },
          to: { height: 0 },
        },
        bounceGentle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-2px)" },
        },
      },
      boxShadow: {
        paper:
          "0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        card: "0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        highlight: "0 0 0 3px rgba(59, 130, 246, 0.15)",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/container-queries"),
  ],
};
