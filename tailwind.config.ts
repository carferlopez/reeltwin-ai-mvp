import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#050505",
        steel: "#16181a",
        zinc: "#25282b",
        signal: "#f8e71c",
        mint: "#41f0a3",
        danger: "#ff4d4d"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Arial", "Helvetica", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"]
      },
      boxShadow: {
        hard: "8px 8px 0 #000"
      }
    }
  },
  plugins: []
};

export default config;
