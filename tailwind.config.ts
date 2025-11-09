import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#181818",
        cream: "#d5d7c4",
        "chart-blue": "#4e5e89",
      },
      fontFamily: {
        instrument: ['"Instrument Serif"', 'serif'],
        mabry: ['"Mabry Mono Pro"', 'monospace'],
        romie: ['"Romie"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
