// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      keyframes: {
        'bounce-slow': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'bounce-slow': 'bounce-slow 3s ease-in-out infinite',
      },
    },
  },
};