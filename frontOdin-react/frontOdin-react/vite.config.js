import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// [AUTH REACT] Equivale a proxy.conf.json de Angular.
// Las peticiones que empiezan por /api se reenvían al backend Spring Boot (puerto 8080).
// Así el navegador cree que todo viene del mismo origen: no hay problemas de CORS
// y la cookie de sesión JSESSIONID funciona igual que en Angular.
//
// Ojo: /login NO se reenvía. /login es una ruta de React; si se reenviara,
// al recargar la página aparecería el login antiguo de Thymeleaf.
export default defineConfig({
  plugins: [react()],
  // El visor 3D (@google/model-viewer) pesa más de 1 MB; es normal, no es un error.
  build: { chunkSizeWarningLimit: 1600 },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
