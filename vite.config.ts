import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'), // ✅ Alias so `@/api` resolves to `src/api`
      },
    },
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    },
    server: {
      port: Number(env.PORT || 5173),
      host: true,
    },
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      env: { VITE_BASE_URL: 'http://api.test' },
    },
  };
});