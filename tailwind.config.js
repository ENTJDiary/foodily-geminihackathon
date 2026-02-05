/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    orange: '#FF6B00', // Vibrant, appetizing orange
                    cream: '#FFF9F2',  // Warm background
                    slate: '#334155',  // Soft text color
                    black: '#121212',  // Deep contrast
                }
            },
            fontFamily: {
                sans: ['Rethink Sans', 'sans-serif'],
                cormorant: ['Cormorant Garamond', 'serif'],
                inter: ['Inter', 'sans-serif'],
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
                '3xl': '2rem',
            }
        }
    },
    plugins: [],
}
