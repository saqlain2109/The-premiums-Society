/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#052e22',
          950: '#021e16',
        },
        luxury: {
          darkGreen: '#042119',
          emerald: '#0a3629',
          accentGreen: '#0d4a38',
          gold: '#D4AF37',
          goldLight: '#F5E6BE',
          goldHover: '#B89628',
          goldMuted: '#E2C775',
        },
        sidebar: {
          dark: '#0F172A',
          darker: '#0B132B',
          accent: '#1E293B',
          border: '#334155',
        }
      },
    },
  },
  plugins: [],
};
