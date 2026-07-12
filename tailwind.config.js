/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 💜 Flipped signature branding variables over to premium neon purple profiles
        brand: '#a855f7',
        brandDark: '#120f1a',
      },
      animation: {
        fadeIn: 'fadeIn 0.6s ease-out forwards',
        scaleUp: 'scaleUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        cardReveal: 'fadeIn 0.4s ease-out cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleUp: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        }
      }
    },
  },
  plugins: [],
}