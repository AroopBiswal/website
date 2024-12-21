/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      keyframes: {
        lavaMotion: {
          '0%': { transform: 'translateY(0) rotate(-20deg)' },
          '50%': { transform: 'translateY(-200px) rotate(20deg)' },
          '100%': { transform: 'translateY(0) rotate(-20deg)' },
        },
        gradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      
      animation: {
        lavaMotion: 'lavaMotion 20s infinite',
        gradient: 'gradient 10s linear infinite',
      },

      colors: {
        lightBg: '#FFDDC7',
        darkBg: '#111827',
      },
    },
  },
  plugins: [],
}