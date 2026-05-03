import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.ADMIN_USERNAME': JSON.stringify(env.ADMIN_USERNAME),
      'process.env.ADMIN_PASSWORD': JSON.stringify(env.ADMIN_PASSWORD),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      watch: {
        ignored: ['**/scripts/**'],
      },
    },
  };
});
