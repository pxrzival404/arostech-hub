import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3b82f6",
        secondary: "#ea580c",
        accent: "#92400e",
        background: "#f8fafc",
        foreground: "#0f172a",
        muted: "#64748b",
        card: "#ffffff",
        border: "#e2e8f0",
      },
      spacing: {
        "xs": "0.75rem",
        "sm": "0.875rem",
        "md": "1rem",
        "lg": "1.125rem",
        "xl": "1.5rem",
        "2xl": "1.875rem",
        "3xl": "2.25rem",
      },
      borderRadius: {
        "sm": "0.25rem",
        "md": "0.375rem",
        "lg": "0.5rem",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui"],
        serif: ["var(--font-merriweather)", "ui-serif", "Georgia"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      maxWidth: {
        "xs": "20rem",
        "sm": "24rem",
        "md": "28rem",
        "lg": "32rem",
        "xl": "36rem",
        "2xl": "42rem",
        "3xl": "48rem",
      },
    },
  },
  plugins: [],
}

export default config
