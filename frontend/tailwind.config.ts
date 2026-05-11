import type { Config } from 'tailwindcss';
export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: { extend: { colors: { ink: '#0A0A0F', panel: '#11121A', violet: '#6A4CFF', neon: '#00E0A8' } } },
  plugins: []
} satisfies Config;
