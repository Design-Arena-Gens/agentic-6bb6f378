import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f7ff",
          100: "#dbeaff",
          200: "#b8d4ff",
          300: "#8eb8ff",
          400: "#5e93ff",
          500: "#3d6dfa",
          600: "#2b52d6",
          700: "#223eb0",
          800: "#1f348b",
          900: "#1e2e6f"
        }
      }
    }
  },
  plugins: []
};

export default config;
