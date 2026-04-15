/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1A3C5E',
          50: '#E8EEF4',
          100: '#D1DDE9',
          200: '#A3BBD3',
          300: '#7599BD',
          400: '#4777A7',
          500: '#1A3C5E',
          600: '#15314D',
          700: '#10263C',
          800: '#0B1B2B',
          900: '#06101A',
        },
        teal: {
          DEFAULT: '#00A896',
          50: '#E6F7F5',
          100: '#CCEFEB',
          200: '#99DFD7',
          300: '#66CFC3',
          400: '#33BFAF',
          500: '#00A896',
          600: '#008778',
          700: '#00655A',
          800: '#00433C',
          900: '#00221E',
        },
        orange: {
          DEFAULT: '#E07B39',
          50: '#FDF0E7',
          100: '#FBE1CF',
          200: '#F7C39F',
          300: '#F3A56F',
          400: '#EF873F',
          500: '#E07B39',
          600: '#C4612A',
          700: '#93491F',
          800: '#623115',
          900: '#31180A',
        },
        surface: '#EAF4F4',
        textColor: '#555555',
      },
      fontFamily: {
        inter: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
