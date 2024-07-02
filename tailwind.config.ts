import colors from 'tailwindcss/colors'

const primary = {
  '50': '#f1f4ff',
  '100': '#e5e8ff',
  '200': '#ced5ff',
  '300': '#a7b1ff',
  '400': '#767fff',
  '500': '#3f42ff',
  '600': '#2118ff',
  '700': '#1007fa',
  '800': '#0d05d2',
  '900': '#0c06ac',
  '950': '#000080',
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      primary,
      secondary: {
        '50': '#fdfaed',
        '100': '#faf1cb',
        '200': '#f4e293',
        '300': '#ecc94b',
        '400': '#e9ba36',
        '500': '#e29c1e',
        '600': '#c87917',
        '700': '#a65717',
        '800': '#874519',
        '900': '#6f3818',
        '950': '#401d08',
      },
      black: colors.black,
      white: colors.white,
      blue: primary,
      red: colors.red,
      yellow: colors.yellow,
      gray: colors.gray,
      green: colors.green,
      transparent: 'transparent',
      current: 'currentColor',
      neutral: colors.neutral
    },
    plugins: [],
  }
}
