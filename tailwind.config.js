/** @type {import('tailwindcss').Config} */

import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Roboto', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        'c-neutral-100': '#FAFAFA',
        // ...
        'c-neutral-400': '#909090',
        'c-neutral-500': '#3E3E3E',
        'c-neutral-600': '#242424',
        'c-neutral-700': '#1E1E1E',
        'c-neutral-800': '#171717',
        'c-neutral-900': '#0F0F0F',

        'c-yellow-100': '#FFF69D',
        // ...
        'c-yellow-500': '#FFED35',
      },
      flexGrow: {
        2: '2'
      }
    },
  },
  plugins: [],
}

