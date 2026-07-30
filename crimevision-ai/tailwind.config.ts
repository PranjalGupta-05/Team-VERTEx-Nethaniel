import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0a0d0f",
        panel: "#111619",
        cyan: "#54e7da",
        acid: "#c5f66f",
        muted: "#8a9897"
      },
      fontFamily: {
        sans: ["Inter", "Aptos", "Segoe UI", "sans-serif"],
        mono: ["IBM Plex Mono", "Cascadia Code", "monospace"]
      }
    }
  },
  plugins: []
};

export default config;
