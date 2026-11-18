import { tailwindTheme } from '../../packages/shared/src/tokens.ts';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      ...tailwindTheme,
      transitionDuration: { DEFAULT: '180ms' },
    },
  },
  plugins: [],
};
