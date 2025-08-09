/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'barber-red': '#A30000',
        'barber-black': '#1A1A1A',
        'barber-white': '#F5F5F5',
        'barber-gray': '#808080',
        'barber-silver': '#C0C0C0',
      },
    },
  },
  plugins: [],
}
