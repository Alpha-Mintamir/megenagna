import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ethiopian: {
          green: '#00843D',
          yellow: '#FCDD09',
          red: '#EF2118',
          gold: '#D4AF37',
          'light-gold': '#F5E6D3',
          'dark-green': '#006633',
          'earth': '#8B4513',
        },
      },
      fontFamily: {
        ethiopic: ['Noto Sans Ethiopic', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
