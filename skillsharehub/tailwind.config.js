// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}', // ali kamorkoli daješ svoje komponente
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        beige: '#f9f1e7', // Dodana tvoja barva
      },
    },
  },
  plugins: [],
}


module.exports = {
  theme: {
    extend: {
      backdropBlur: {
        sm: '4px',
        md: '8px',
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out',
        slideIn: 'slideIn 0.3s ease-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' }
        }
      }
    }
  }
}
