import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }], // 10px
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        accent: {
          DEFAULT: '#f59e0b',
          light: '#fbbf24',
          dim: '#d97706',
          glow: 'rgba(245, 158, 11, 0.15)',
        },
      },
      borderRadius: {
        'lg': '0.5rem',
        'xl': '0.75rem',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      animation: {
        'grid-pulse': 'grid-pulse 8s ease-in-out infinite',
        'pulse-slow': 'pulse 2s ease-in-out infinite',
      },
      keyframes: {
        'grid-pulse': {
          '0%, 100%': { opacity: '0.30' },
          '50%': { opacity: '0.40' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
export default config;