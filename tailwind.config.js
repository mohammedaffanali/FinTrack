/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ivory: {
          50: '#fdfcf8',
          100: '#faf6ee',
          200: '#f4ecd9',
          300: '#ecdfc1',
        },
        charcoal: {
          50: '#f6f5f2',
          100: '#e8e6e0',
          200: '#c9c5bb',
          300: '#a8a298',
          400: '#7c766b',
          500: '#5a554b',
          600: '#3d3930',
          700: '#2b2820',
          800: '#1c1a15',
          900: '#121110',
        },
        forest: {
          50: '#f0f7f2',
          100: '#dcebe0',
          200: '#b6d4be',
          300: '#86b896',
          400: '#5a9a70',
          500: '#3d7d54',
          600: '#2d6442',
          700: '#234f35',
          800: '#1c3f2b',
          900: '#152e21',
        },
        sage: {
          50: '#f5f7f4',
          100: '#e8ede6',
          200: '#d0dacd',
          300: '#aebfaa',
          400: '#8a9f85',
          500: '#6b8566',
          600: '#546b51',
          700: '#425540',
          800: '#364536',
          900: '#2c392d',
        },
        apricot: {
          50: '#fef6ef',
          100: '#fce8d6',
          200: '#f8d0ad',
          300: '#f4b27e',
          400: '#ef9251',
          500: '#e97a33',
          600: '#d26428',
          700: '#b04e22',
          800: '#8d3f20',
          900: '#723520',
        },
        cream: {
          50: '#fdfbf6',
          100: '#faf5ec',
          200: '#f5eede',
          300: '#efe2c8',
        },
      },
      fontFamily: {
        serif: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'path-draw': 'pathDraw 1.5s ease-out forwards',
        'path-draw-slow': 'pathDraw 2.5s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pathDraw: {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
