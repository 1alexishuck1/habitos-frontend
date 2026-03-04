import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
        port: 5173,
        proxy: {
            '/auth': 'http://localhost:4000',
            '/habits': 'http://localhost:4000',
            '/tasks': 'http://localhost:4000',
            '/stats': 'http://localhost:4000',
            '/reflections': 'http://localhost:4000',
            '/friends': 'http://localhost:4000',
            '/push': 'http://localhost:4000',
            '/gym': 'http://localhost:4000',
        },
    },
});
