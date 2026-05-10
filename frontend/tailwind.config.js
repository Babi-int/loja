/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        maricota: {
          pink: "#f7b6c8",
          rose: "#fff1f5",
          blue: "#b7dff5",
          mint: "#cdebd6",
          yellow: "#fff3bf",
          text: "#4f4650"
        }
      },
      boxShadow: {
        soft: "0 12px 35px rgba(173, 127, 145, 0.16)"
      }
    }
  },
  plugins: []
};
