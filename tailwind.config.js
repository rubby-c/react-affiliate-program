/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './lib/**/*.{js,ts,jsx,tsx}'
    ],
    theme: {
        extend: {
            height: {
                '128': '30rem',
            }
        }
    },
    plugins: [],
    prefix: 'af-'
}