import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eefcfb',
          100: '#d9f7f4',
          500: '#0f766e',
          600: '#0b4f68',
          700: '#123c5b',
          900: '#0d203d',
        },
      },
      boxShadow: {
        card: '0 10px 30px rgba(15, 32, 61, 0.12)',
      },
    },
  },
  plugins: [],
};

export default config;
