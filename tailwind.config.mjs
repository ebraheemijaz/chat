/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)", // Existing custom color
        foreground: "var(--foreground)", // Existing custom color
        coursebuddy: "#32064A", // Add the custom color
      },
    },
  },
  plugins: [],
};
