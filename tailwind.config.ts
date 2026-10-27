import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#050B18", // noir profond teinté bleu nuit
        brand: "#1E3A73", // bleu foncé SoluTaux (principal)
        ai: "#3B6FD9", // bleu plus clair (partenaire de dégradé / interactif)
        neon: "#B91C1C", // rouge foncé SoluTaux (accents logo)
        savings: "#5B9CFF",
        alert: "#F97316",
        surface: "#0A1530",
        muted: "#94a3b8",
      },
      fontFamily: {
        sans: ["Montserrat", "system-ui", "sans-serif"],
        display: ["Pirata One", "serif"],
      },
      boxShadow: {
        card: "0 10px 40px -12px rgba(0, 0, 0, 0.6)",
        glow: "0 0 0 1px rgba(59,111,217,0.35), 0 0 28px -4px rgba(59,111,217,0.5)",
        neon: "0 0 24px -2px rgba(185,28,28,0.6)",
      },
      keyframes: {
        gradientMove: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        gradientMove: "gradientMove 6s ease infinite",
        fadeUp: "fadeUp 0.4s ease both",
        pulseSoft: "pulseSoft 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
