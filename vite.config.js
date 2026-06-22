import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    // Load all env variables regardless of prefix (3rd arg '')
    const env = loadEnv(mode, process.cwd(), '');
    
    // Set output directory based on env var, fallback to 'dist'
    let buildDir = 'dist';
    if (env.VITE_BUILD_MODE === 'photoshop') {
        buildDir = 'photoshop-plugin/webview-contents';
    }
    else if (env.VITE_BUILD_MODE === 'photopea') {
        buildDir = 'photopea-plugin';
    }
    else if (env.VITE_BUILD_MODE === 'electron') {
        buildDir = 'electron-app/app';
    }

    return {
        build: {
            outDir: buildDir,
        },
        base: "./",
    };
});