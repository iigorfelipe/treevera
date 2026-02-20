import { BREAKPOINTS } from "./src/common/constants/breakpoints";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens: BREAKPOINTS,
    extend: {
      keyframes: {
        pulse: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
        wiggle: {
          "0%, 100%": {
            transform: "scale(1) rotate(-6deg)",
            opacity: "1",
          },
          "25%": {
            transform: "scale(1.05) rotate(0deg)",
            opacity: "0.95",
          },
          "50%": {
            transform: "scale(1) rotate(6deg)",
            opacity: "1",
          },
          "75%": {
            transform: "scale(1.05) rotate(0deg)",
            opacity: "0.95",
          },
        },
        shine: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        grow: {
          "0%": {
            transform: "scaleY(0.7) scaleX(0.95)",
            opacity: "0.7",
          },
          "30%": {
            transform: "scaleY(1.08) scaleX(1.02)",
            opacity: "1",
          },
          "60%": {
            transform: "scaleY(0.97) scaleX(0.98)",
            opacity: "0.95",
          },
          "80%": {
            transform: "scaleY(1.03) scaleX(1.01)",
            opacity: "1",
          },
          "100%": {
            transform: "scaleY(1) scaleX(1)",
            opacity: "1",
          },
        },
      },
      animation: {
        wiggle: "wiggle 1.5s ease-in-out infinite",
        pulse: "pulse 2s ease-in-out infinite",
        skeleton: "shine 1.2s linear infinite",
        grow: "grow 1.6s cubic-bezier(0.4,0,0.2,1) infinite",
      },
      backgroundImage: {
        skeleton: `linear-gradient(90deg, 
          rgba(229,231,235,0.1) 0%, 
          rgba(229,231,235,0.3) 50%, 
          rgba(229,231,235,0.1) 100%)`,
      },
      backgroundSize: {
        skeleton: "200% 100%",
      },
    },
  },
  plugins: [],
};
