import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@worketa/api': path.resolve(__dirname, '../../packages/api/src'),
        '@worketa/auth': path.resolve(__dirname, '../../packages/auth/src'),
        '@worketa/schemas': path.resolve(__dirname, '../../packages/schemas/src'),
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (path) => path,
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      rollupOptions: {
        external: [],
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': ['clsx'],
            'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
            'api-vendor': ['axios', '@tanstack/react-query'],
          },
        },
      },
    },
  };
});
