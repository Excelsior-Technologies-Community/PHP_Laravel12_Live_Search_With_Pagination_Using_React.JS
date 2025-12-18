import { defineConfig } from 'vite';                   // Import Vite's defineConfig function
import laravel from 'laravel-vite-plugin';            // Import Laravel plugin for Vite
import react from '@vitejs/plugin-react';             // Import React plugin for Vite
import tailwindcss from '@tailwindcss/vite';          // Import TailwindCSS plugin for Vite

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.js'],  // Entry points for CSS and JS
            refresh: true,                                            // Enable automatic refresh on changes
        }),
        react(),       // Enable React support
        tailwindcss(), // Enable TailwindCSS support
    ],
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'], // Ignore Laravel view cache files to avoid unnecessary reloads
        },
    },
});
