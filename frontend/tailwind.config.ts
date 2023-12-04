import type { Config } from 'tailwindcss'





const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      keyframes: {
        gradient: {
          '0%': { 'background-size': '100%', 'background-position': '100% 100%' },
          '50%': { 'background-size': '100%', 'background-position': '100% 100%' },
          '100%': { 'background-size': '100%', 'background-position': '100% 100%' },
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(circle at bottom right, var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-linear': 'linear-gradient(135deg, var(--tw-gradient-stops))',

      },
      animation: {
        'spin-slow': 'spin 120s linear infinite',
        'pulse-slow': 'pulse 15s linear infinite',
        'gradient': 'gradient 1.5s ease infinite',

      },
      spacing: {
        '2.5': '10px',
      }
    },
  },
}
export default config
