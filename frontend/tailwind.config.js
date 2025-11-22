/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Minimalist palette
                background: '#FAFAFA',
                surface: '#FFFFFF',
                primary: {
                    50: '#F5F5F5',
                    100: '#E5E5E5',
                    200: '#D4D4D4',
                    300: '#A3A3A3',
                    400: '#737373',
                    500: '#525252',
                    600: '#404040',
                    700: '#262626',
                    800: '#171717',
                    900: '#0A0A0A',
                    DEFAULT: '#171717', // Soft black
                },
                accent: '#2563EB', // Subtle blue for interactions
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                'premium': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
            },
        },
    },
    plugins: [],
}
