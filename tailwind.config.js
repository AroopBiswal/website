/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        lavaMotion: {
          '0%': { transform: 'translateY(0) rotate(-20deg)' },
          '50%': { transform: 'translateY(-200px) rotate(20deg)' },
          '100%': { transform: 'translateY(0) rotate(-20deg)' },
        },
      },
      animation: {
        'lavaMotion': 'lavaMotion 20s infinite',
      },
    },
  },
  plugins: [],
}