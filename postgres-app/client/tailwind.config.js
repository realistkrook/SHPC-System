/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', // Enforce dark mode manually via class
    theme: {
        extend: {
            colors: {
                aotea: {
                    teal: '#007971',
                    dark: '#005a54',
                    gold: '#D4AF37',
                    slate: '#1e293b',
                },
                slate: {
                    850: '#151e2e',
                    950: '#020617',
                }
            },
            fontFamily: {
                sans: ['Montserrat', 'sans-serif'],
            },
            boxShadow: {
                'glow': '0 0 20px rgba(0, 121, 113, 0.5)',
                'glow-gold': '0 0 20px rgba(212, 175, 55, 0.3)',
            }
        },
    },
    plugins: [],
}
