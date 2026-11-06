import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Ocean blue taken from the JKI OCEAN logo (#039DD5)
        brand: {
          50: "#ebf8fe",
          100: "#d3f0fc",
          200: "#a8e1f8",
          300: "#6dccf1",
          400: "#2cb3e6",
          500: "#039dd5",
          600: "#027fb3",
          700: "#056690",
          800: "#0a5576",
          900: "#0d4762",
          950: "#082d40",
        },
        // Graphite from the logo's "JKI" circle
        ink: {
          50: "#f6f7f9",
          100: "#eceef2",
          200: "#d5d9e1",
          300: "#b0b7c4",
          400: "#858ea0",
          500: "#666f82",
          600: "#51596a",
          700: "#424856",
          800: "#2b2f38",
          900: "#1c1f26",
          950: "#111318",
        },
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(17,19,24,0.04), 0 4px 16px -4px rgba(17,19,24,0.08)",
        lift: "0 2px 4px rgba(17,19,24,0.04), 0 16px 40px -12px rgba(3,157,213,0.25)",
        glow: "0 0 0 1px rgba(3,157,213,0.15), 0 8px 30px -6px rgba(3,157,213,0.45)",
      },
      keyframes: {
        shine: {
          "0%": { backgroundPosition: "200% center" },
          "100%": { backgroundPosition: "-200% center" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)", filter: "blur(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)", filter: "blur(0)" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        aurora: {
          "0%, 100%": { transform: "translate(0,0) scale(1)" },
          "33%": { transform: "translate(8%, -10%) scale(1.15)" },
          "66%": { transform: "translate(-6%, 8%) scale(0.92)" },
        },
        "border-spin": {
          "100%": { transform: "rotate(360deg)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        shine: "shine 4s linear infinite",
        "fade-up": "fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both",
        "pop-in": "pop-in 0.25s cubic-bezier(0.16,1,0.3,1) both",
        aurora: "aurora 18s ease-in-out infinite",
        "aurora-slow": "aurora 26s ease-in-out infinite reverse",
        "border-spin": "border-spin 4s linear infinite",
        float: "float 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
