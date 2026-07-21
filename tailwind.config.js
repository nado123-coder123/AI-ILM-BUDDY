/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#FAF6EF',
        surface: '#FFFFFF',
        surfaceMuted: '#F1ECE1',
        ink: '#1C2321',
        inkMuted: '#5C6663',
        teal: { DEFAULT: '#0B3D3A', light: '#14544F' },
        gold: { DEFAULT: '#C9A961', muted: '#E7D9B8' },
        border: '#E3DCCB',
        error: '#A13D3D',
        success: '#3D7A5E',
      },
      fontFamily: {
        arabic: ['"Noto Naskh Arabic"', 'Traditional Arabic', 'serif'],
      },
    },
  },
  plugins: [],
};
