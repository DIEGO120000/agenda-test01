
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/agenda-virtual/',
  define: {
    // Aseguramos que process.env esté disponible si el entorno lo requiere
    'process.env': {}
  }
});
