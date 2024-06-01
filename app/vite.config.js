import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react()
    ],
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        minify: 'esbuild',
        sourcemap: true,
    },
    optimizeDeps: {
        include: ['react', 'react-dom'],
    }
})
