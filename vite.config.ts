import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

dotenv.config(); // charge les variables depuis .env.local ou .env

export default defineConfig({
  plugins: [react()],
  server: {
    host: true
  },
  define: {
    'process.env.GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY),
    // ajoute ici d'autres variables nécessaires si besoin
  }
});
