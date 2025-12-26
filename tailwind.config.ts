import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // Scanner-specific animations
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-10px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(10px)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'scale-up': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        shake: 'shake 0.3s cubic-bezier(.36,.07,.19,.97) both',
        pulse: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scale-up': 'scale-up 0.2s ease-out',
      },
      // Scanner color palette
      colors: {
        scanner: {
          idle: '#3B82F6',      // Blue
          detecting: '#EAB308', // Yellow
          success: '#22C55E',   // Green
          error: '#EF4444',     // Red
        },
      },
    },
  },
  plugins: [],
};

export default config;

