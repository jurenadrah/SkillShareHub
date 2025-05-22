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
