import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      height: theme => ({
        '50vh': '50vh',
        '75vh': '75vh'
      }),
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
      },
      keyframes: {
        glow: {
          '0%, 100%': { borderColor: 'rgba(16, 185, 129, 0.4)' },
          '50%': { borderColor: 'rgba(16, 185, 129, 1)' }
        }
      },
      animation: {
        glow: 'glow 2.5s infinite'
      }
    }
  },
  plugins: []
}
export default config
