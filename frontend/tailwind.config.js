/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#3E2723',     /* Deep Espresso Brown */
                secondary: '#8D6E63',   /* Mocha Brown */
                accent: '#EFEBE9',      /* Milky Latte Off-White */
                dark: '#212121',        /* Charcoal */
                light: '#F5F5F5',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
