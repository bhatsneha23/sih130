import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        indus: {
          ink: "#172b3a",
          blue: "#27628a",
          mist: "#edf5fa"
        }
      }
    }
  },
  plugins: []
};

export default config;
