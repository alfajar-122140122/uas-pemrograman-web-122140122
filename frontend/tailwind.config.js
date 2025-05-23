/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Ensure it scans all relevant files
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#FFFFFF', // White background
        'bg-secondary': '#F9FAFB', // Very light gray for cards/secondary areas (Tailwind gray-50)
        'accent-primary': '#22C55E', // Green-500
        'accent-primary-dark': '#16A34A', // Green-600 (for hover/active)
        'text-primary': '#1F2937', // Gray-800 (main text)
        'text-secondary': '#4B5563', // Gray-600 (secondary text)
        'border-color': '#E5E7EB', // Gray-200 (for borders)
        'white': '#FFFFFF',
        'black': '#000000',
        'transparent': 'transparent',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'], // Set Poppins as default sans-serif
        inter: ['Inter', 'sans-serif'],
        arabic: ['Noto Naskh Arabic', 'serif'], // For Arabic text
      },
      borderRadius: {
        '2xl': '1rem', // Default is 1rem, ensure it's what you want or customize
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // Optional: for better default form styling
  ],
}
