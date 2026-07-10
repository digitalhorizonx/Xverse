import type { Config } from "tailwindcss";

function themeColor(name: string) {
  return `rgb(var(--color-${name}) / <alpha-value>)`;
}

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./data/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        white: themeColor("white"),
        void: "#020308",
        ink: {
          950: themeColor("ink-950"),
          900: themeColor("ink-900"),
          800: themeColor("ink-800"),
          700: themeColor("ink-700"),
          600: themeColor("ink-600"),
          500: themeColor("ink-500"),
        },
        mist: {
          500: themeColor("mist-500"),
          400: themeColor("mist-400"),
          300: themeColor("mist-300"),
          200: themeColor("mist-200"),
          100: themeColor("mist-100"),
        },
        teal: {
          300: themeColor("teal-300"),
          400: themeColor("teal-400"),
          500: themeColor("teal-500"),
          600: themeColor("teal-600"),
        },
        amber: {
          300: themeColor("amber-300"),
          400: themeColor("amber-400"),
          500: themeColor("amber-500"),
          600: themeColor("amber-600"),
        },
        coral: {
          400: themeColor("coral-400"),
          500: themeColor("coral-500"),
          600: themeColor("coral-600"),
        },
        nebula: {
          300: themeColor("nebula-300"),
          400: themeColor("nebula-400"),
          500: themeColor("nebula-500"),
          600: themeColor("nebula-600"),
        },
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        display: ["var(--font-cal)", "var(--font-inter)", "sans-serif"],
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(90deg, #20b8a4 0%, #7fe4d6 25%, #ffd9a0 50%, #fb9645 75%, #f96a4d 100%)",
        "brand-gradient-text":
          "linear-gradient(90deg, #159085 0%, #20b8a4 25%, #fb9645 50%, #f5793a 75%, #e14a3a 100%)",
        "nebula-gradient":
          "linear-gradient(135deg, rgba(124,58,237,0.25) 0%, rgba(32,184,164,0.18) 50%, rgba(251,150,69,0.16) 100%)",
        "radial-glow":
          "radial-gradient(circle at 50% 0%, rgba(var(--color-teal-400) / 0.25), transparent 60%)",
        "radial-glow-nebula":
          "radial-gradient(circle at 50% 50%, rgba(var(--color-nebula-500) / 0.3), transparent 65%)",
        "grid-lines":
          "linear-gradient(to right, rgba(var(--color-white) / 0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(var(--color-white) / 0.035) 1px, transparent 1px)",
      },
      boxShadow: {
        glow: "0 0 60px -15px rgba(var(--color-teal-400) / 0.35)",
        "glow-amber": "0 0 60px -15px rgba(var(--color-amber-500) / 0.35)",
        "glow-nebula": "0 0 80px -20px rgba(var(--color-nebula-500) / 0.45)",
        card: "0 1px 0 0 rgba(var(--color-white) / 0.06) inset, 0 0 0 1px rgba(var(--color-white) / 0.06)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      animation: {
        "fade-up": "fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) forwards",
        float: "float 6s ease-in-out infinite",
        "spin-slow": "spin 14s linear infinite",
        "spin-slower": "spin 40s linear infinite",
        shimmer: "shimmer 2.5s linear infinite",
        twinkle: "twinkle 3.2s ease-in-out infinite",
        "arrival-fade": "arrivalFade 0.95s ease-out forwards",
      },
      keyframes: {
        arrivalFade: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        twinkle: {
          "0%,100%": { opacity: "0.25" },
          "50%": { opacity: "1" },
        },
      },
      maxWidth: {
        "8xl": "90rem",
      },
    },
  },
  plugins: [],
};

export default config;
