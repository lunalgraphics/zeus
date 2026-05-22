import { defineConfig } from 'vite';

export default defineConfig({
    root: '.',
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            // Vendor scripts are loaded as globals, not bundled
            external: [],
        },
    },
    server: {
        open: true,
    },
    // Ensure lib/ files are copied to dist as static assets
    publicDir: false,
});
