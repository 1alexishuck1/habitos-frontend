/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{ts,tsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            colors: {
                // Primary brand — sky blue
                primary: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    200: '#bae6fd',
                    400: '#38bdf8',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                },
                // Dark surfaces
                surface: {
                    900: '#0f172a',
                    800: '#1e293b',
                    700: '#293548',
                    600: '#334155',
                    500: '#475569',
                },
                // Accent
                accent: {
                    green: '#22d3a0',
                    amber: '#fbbf24',
                    red: '#f87171',
                    purple: '#a78bfa',
                },
            },
            animation: {
                'fade-in': 'fadeIn 0.2s ease-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'slide-up-full': 'slideUpFull 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
                'scale-in': 'scaleIn 0.2s ease-out',
                'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
                slideUp: { from: { transform: 'translateY(12px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
                slideUpFull: { from: { transform: 'translateY(100%)' }, to: { transform: 'translateY(0)' } },
                scaleIn: { from: { transform: 'scale(0.95)', opacity: '0' }, to: { transform: 'scale(1)', opacity: '1' } },
                pulseSoft: { '0%,100%': { opacity: '1' }, '50%': { opacity: '.6' } },
            },
        },
    },
    plugins: [],
};
