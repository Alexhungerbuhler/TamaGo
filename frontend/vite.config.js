import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';


export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendHost = process.env.VITE_WS_HOST || env.VITE_WS_HOST || 'localhost';
  const backendPort = process.env.BACKEND_PORT || env.BACKEND_PORT || 3000;

  return {
    plugins: [
      vue(),
    ],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    server: {
      proxy: {
        '/api': {
          target: `http://${backendHost}:${backendPort}`,
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: '../backend/dist', // build du front dans le dossier public du back
      emptyOutDir: true
    }
  };
});