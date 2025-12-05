import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

dotenv.config(); // charge les variables depuis .env.local ou .env

// 🔐 seules les variables commençant par VITE_ sont exposées au frontend
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
  },
  define: {
    __APP_ENV__: JSON.stringify(process.env.VITE_APP_ENV), // si tu as besoin d'une variable d'environnement globale
    'process.env.GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY),
    // ajoute ici d'autres variables nécessaires
  },
});
