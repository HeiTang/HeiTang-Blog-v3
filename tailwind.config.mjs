import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  safelist: [
    // Bento grid column spans — used dynamically in BentoCell
    'col-span-2','col-span-3','col-span-4','col-span-6','col-span-8','col-span-12',
  ],
  theme: {
    extend: {
      colors: {},
      fontFamily: {
        sans: ['Inter', 'Noto Sans TC', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Orbitron', 'sans-serif'],
      },
    },
  },
  plugins: [
    typography,
  ],
};
