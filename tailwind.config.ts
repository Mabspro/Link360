import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        ocean: {
          DEFAULT: "#0A2540",
          50: "#E8F4FC",
          100: "#D1E9F9",
          200: "#A3D3F3",
          300: "#75BDED",
          400: "#47A7E7",
          500: "#1991E1",
          600: "#1474B4",
          700: "#0F5787",
          800: "#0A3A5A",
          900: "#0A2540",
        },
        sand: {
          DEFAULT: "#D4A574",
          50: "#FBF6F0",
          100: "#F7EDE1",
          200: "#EFDBC3",
          300: "#E7C9A5",
          400: "#DFB787",
          500: "#D4A574",
          600: "#C48A4F",
          700: "#9A6D3D",
          800: "#70502C",
          900: "#46321C",
        },
        zambia: {
          green: "#1B5E20",
          red: "#D32F2F",
          black: "#212121",
          orange: "#F57C00",
        },
        sunset: {
          DEFAULT: "#E65100",
          50: "#FFF3E0",
          100: "#FFE0B2",
          200: "#FFCC80",
          300: "#FFB74D",
          400: "#FFA726",
          500: "#E65100",
          600: "#BF360C",
          700: "#E65100",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "SF Mono", "monospace"],
      },
      fontSize: {
        display: ["3.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        h1: ["2.5rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        h2: ["2rem", { lineHeight: "1.25" }],
        h3: ["1.5rem", { lineHeight: "1.3" }],
        h4: ["1.25rem", { lineHeight: "1.4" }],
        "body-lg": ["1.125rem", { lineHeight: "1.6" }],
        body: ["1rem", { lineHeight: "1.6" }],
        small: ["0.875rem", { lineHeight: "1.5" }],
        tiny: ["0.75rem", { lineHeight: "1.5" }],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0, 0, 0, 0.1)",
        "card-hover": "0 8px 25px rgba(0, 0, 0, 0.12)",
        button: "0 4px 14px rgba(230, 81, 0, 0.25)",
        "button-hover": "0 6px 20px rgba(230, 81, 0, 0.35)",
        "input-focus": "0 0 0 3px rgba(74, 144, 217, 0.2)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "slide-up": "slideUp 0.5s ease-out",
        "fade-in": "fadeIn 0.3s ease-out",
      },
      keyframes: {
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      transitionTimingFunction: {
        "bounce-out": "cubic-bezier(0.34, 1.56, 0.64, 1)",
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
export default config;
