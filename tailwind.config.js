/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './lib/**/*.{js,ts,jsx,tsx}'
    ],
    theme: {
        extend: {
            height: {
                '112': '28rem',
            }
        }
    },
    plugins: [],
    prefix: 'af-'
}