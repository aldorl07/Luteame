import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand
        "primary":                 "#e3b5ff",
        "primary-container":       "#a700fe",
        "on-primary":              "#4e0079",
        "on-primary-container":    "#fbecff",
        "primary-fixed":           "#f3daff",
        "primary-fixed-dim":       "#e3b5ff",
        "on-primary-fixed":        "#2f004c",
        "on-primary-fixed-variant":"#6e00aa",
        "inverse-primary":         "#9100dd",
        // Secondary
        "secondary":               "#c4c7c7",
        "secondary-container":     "#434748",
        "on-secondary":            "#2d3131",
        "on-secondary-container":  "#b2b6b6",
        "secondary-fixed":         "#e0e3e3",
        "secondary-fixed-dim":     "#c4c7c7",
        "on-secondary-fixed":      "#181c1d",
        "on-secondary-fixed-variant":"#434748",
        // Tertiary
        "tertiary":                "#ffb779",
        "tertiary-container":      "#a45b00",
        "on-tertiary":             "#4c2700",
        "on-tertiary-container":   "#ffeee2",
        "tertiary-fixed":          "#ffdcc1",
        "tertiary-fixed-dim":      "#ffb779",
        "on-tertiary-fixed":       "#2e1500",
        "on-tertiary-fixed-variant":"#6c3a00",
        // Error
        "error":                   "#ffb4ab",
        "error-container":         "#93000a",
        "on-error":                "#690005",
        "on-error-container":      "#ffdad6",
        // Surface
        "background":              "#18111c",
        "on-background":           "#ecdeef",
        "surface":                 "#18111c",
        "surface-dim":             "#18111c",
        "surface-bright":          "#3f3643",
        "surface-container-lowest":"#120b17",
        "surface-container-low":   "#201925",
        "surface-container":       "#241d29",
        "surface-container-high":  "#2f2733",
        "surface-container-highest":"#3a323f",
        "surface-variant":         "#3a323f",
        "surface-tint":            "#e3b5ff",
        "on-surface":              "#ecdeef",
        "on-surface-variant":      "#d2c1d8",
        "inverse-surface":         "#ecdeef",
        "inverse-on-surface":      "#362d3a",
        // Outline
        "outline":                 "#9b8ba1",
        "outline-variant":         "#4f4255",
      },
      fontFamily: {
        poppins:    ["Poppins", "sans-serif"],
        montserrat: ["Montserrat", "sans-serif"],
        // Semantic aliases
        "display-lg":        ["Poppins", "sans-serif"],
        "display-lg-mobile": ["Poppins", "sans-serif"],
        "headline-md":       ["Montserrat", "sans-serif"],
        "title-lg":          ["Montserrat", "sans-serif"],
        "body-lg":           ["Montserrat", "sans-serif"],
        "body-sm":           ["Montserrat", "sans-serif"],
        "label-caps":        ["Montserrat", "sans-serif"],
      },
      fontSize: {
        "display-lg":        ["48px", { lineHeight: "1.1",  letterSpacing: "-0.02em", fontWeight: "800" }],
        "display-lg-mobile": ["32px", { lineHeight: "1.2",  fontWeight: "800" }],
        "headline-md":       ["24px", { lineHeight: "1.3",  fontWeight: "700" }],
        "title-lg":          ["20px", { lineHeight: "1.4",  fontWeight: "600" }],
        "body-lg":           ["16px", { lineHeight: "1.6",  fontWeight: "400" }],
        "body-sm":           ["14px", { lineHeight: "1.5",  fontWeight: "400" }],
        "label-caps":        ["12px", { lineHeight: "1",    letterSpacing: "0.1em", fontWeight: "700" }],
      },
      spacing: {
        xs:             "4px",
        sm:             "12px",
        md:             "24px",
        lg:             "48px",
        xl:             "80px",
        gutter:         "24px",
        "container-max":"1280px",
        base:           "8px",
      },
      borderRadius: {
        DEFAULT: "0.125rem",   // 2px
        lg:      "0.25rem",    // 4px
        xl:      "0.5rem",     // 8px
        "2xl":   "0.75rem",    // 12px
        full:    "9999px",
      },
      boxShadow: {
        glow:      "0 0 20px rgba(167, 0, 254, 0.4)",
        "glow-lg": "0 0 30px rgba(167, 0, 254, 0.6)",
        "glow-sm": "0 0 10px rgba(167, 0, 254, 0.25)",
      },
      backgroundImage: {
        "modular-grid": "radial-gradient(circle at center, rgba(242,245,245,0.03) 1px, transparent 1px)",
      },
      backgroundSize: {
        "8px": "8px 8px",
      },
      keyframes: {
        "fade-in": {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%":   { opacity: "0", transform: "translateX(16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 10px rgba(167,0,254,0.3)" },
          "50%":      { boxShadow: "0 0 25px rgba(167,0,254,0.7)" },
        },
      },
      animation: {
        "fade-in":        "fade-in 0.4s ease forwards",
        "slide-in-right": "slide-in-right 0.3s ease forwards",
        "pulse-glow":     "pulse-glow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
