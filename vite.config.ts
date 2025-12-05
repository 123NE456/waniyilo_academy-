import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';

dotenv.config(); // optionnel si tu utilises déjà Vercel Environment Variables

export default defineConfig({
  plugins: [react()],
  server: {
    host: true
  },
  define: {
    __APP_ENV__: JSON.stringify(process.env.VITE_APP_ENV),
    'process.env.VITE_GEMINI_API_KEY': JSON.stringify(process.env.VITE_GEMINI_API_KEY),
  },
});
