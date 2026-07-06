/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#0B1220",
          panel: "#101a2e",
          elevated: "#16223b",
        },
        accent: {
          teal: "#14b8a6",
          tealDark: "#0d9488",
          cyan: "#22d3ee",
        },
        ink: {
          primary: "#e7ecf5",
          muted: "#8b96ac",
          faint: "#5b6579",
        },
        online: "#34d399",
        danger: "#f87171",
      },
      fontFamily: {
        display: ["Sora", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 3px rgba(20, 184, 166, 0.15)",
        panel: "0 8px 30px rgba(0,0,0,0.35)",
      },
      keyframes: {
        breathe: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(52, 211, 153, 0.55)" },
          "50%": { boxShadow: "0 0 0 5px rgba(52, 211, 153, 0)" },
        },
        popIn: {
          "0%": { opacity: 0, transform: "translateY(6px) scale(0.98)" },
          "100%": { opacity: 1, transform: "translateY(0) scale(1)" },
        },
        slideIn: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
      animation: {
        breathe: "breathe 2s infinite",
        popIn: "popIn 0.2s ease-out",
        slideIn: "slideIn 0.25s ease-out",
      },
    },
  },
  plugins: [],
};
