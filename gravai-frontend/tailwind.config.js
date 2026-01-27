/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app//*.{js,ts,jsx,tsx}',
    './src/components//*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      boxShadow: {
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },
    },
  },
  plugins: [],
};