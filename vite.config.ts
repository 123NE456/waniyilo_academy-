import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 🔐 uniquement les variables commençant par VITE_ sont exposées au frontend
export default defineConfig({
  plugins: [react()],
  server: {
    host: true
  },
  define: {
    __APP_ENV__: process.env.VITE_APP_ENV
  }
});
