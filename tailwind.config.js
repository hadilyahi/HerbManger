/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}", // إذا تستخدم App Router
    "./pages/**/*.{js,ts,jsx,tsx}", // إذا تستخدم Pages Router
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
theme: {
  extend: {
    fontFamily: {
      cairo: ["var(--font-cairo)", "sans-serif"],
      geistSans: ["var(--font-geist-sans)", "sans-serif"],
      geistMono: ["var(--font-geist-mono)", "monospace"],
    },
  },
},


  plugins: [],
}
