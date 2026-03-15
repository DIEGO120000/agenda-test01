import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Asegúrate de que coincida con el nombre de tu repositorio
  base: '/agenda-test01/', 
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          // CAMBIO CLAVE: Se actualizó de '@google/genai' a '@google/generative-ai'
          'vendor-utils': ['lucide-react', 'date-fns', '@google/generative-ai']
        }
      }
    }
  }
});