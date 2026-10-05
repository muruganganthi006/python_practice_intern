/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0B1F3A',
        orange: '#FF6B35',
        canvas: '#F8FAFC',
        text: '#172033',
        success: '#16A34A',
        warning: '#F59E0B',
        error: '#DC2626',
      },
      boxShadow: {
        soft: '0 10px 30px rgba(11, 31, 58, 0.08)',
      },
    },
  },
  plugins: [],
};
