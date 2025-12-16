/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f172a',
        surface: '#1e293b',
        primary: '#0ea5e9',
        secondary: '#64748b',
        success: '#10b981',
        danger: '#ef4444',
      }
    },
  },
  plugins: [],
}
