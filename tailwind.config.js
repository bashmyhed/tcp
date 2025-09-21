/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ctp': {
          base: '#1e1e2e',
          surface0: '#313244',
          surface1: '#45475a',
          surface2: '#585b70',
          text: '#cdd6f4',
          subtext1: '#bac2de',
          subtext0: '#a6adc8',
          blue: '#89b4fa',
          pink: '#f38ba8',
          green: '#a6e3a1',
          yellow: '#f9e2af',
          red: '#f38ba8',
          mauve: '#cba6f7',
        },
        // True terminal colors
        'term': {
          green: '#00ff00',
          amber: '#ffbf00',
          red: '#ff5555',
          blue: '#55aaff',
          cyan: '#00ffff',
          magenta: '#ff55ff',
        }
      },
      fontFamily: {
        'mono': ['Fira Code', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
}
