/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/*.{html,js,css}",,
    "./views/**/*.ejs"
  ],
  theme: {
    extend: {
      fontFamily: {
        jetbrains: ['JetBrainsMono', 'sans-serif']
      }
    },
  },
  plugins: [
    {
      tailwindcss: {},
      autoprefixer: {},
    },
  ],
}

