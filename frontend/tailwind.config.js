/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        maricota: {
          pink: "#57a0d2",
          rose: "#ecf6fc",
          blue: "#8ad0f0",
          mint: "#d4eaf5",
          yellow: "#f4fafd",
          text: "#1a3652"
        }
      },
      boxShadow: {
        soft: "0 12px 35px rgba(39, 120, 180, 0.18)"
      }
    }
  },
  plugins: []
};
