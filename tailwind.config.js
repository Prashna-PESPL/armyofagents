/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        space: {
          black: '#0A0B0D',
          dark: '#13151A',
          gray: '#1F2128',
          light: '#2A2D36'
        },
        electric: {
          blue: '#00F0FF',
          purple: '#9D00FF',
          pink: '#FF00E5'
        },
        status: {
          success: '#00FF94',
          warning: '#FFB800',
          error: '#FF3A5E'
        }
      },
      fontFamily: {
        'space-grotesk': ['Space Grotesk', 'sans-serif'],
        'inter': ['Inter', 'sans-serif']
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'breathe': 'breathe 4s ease-in-out infinite'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.03)' }
        }
      }
    },
  },
  plugins: [],
};