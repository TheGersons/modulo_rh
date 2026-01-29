// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'; // Importa el plugin de Tailwind

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Actívalo aquí
  ],
});
