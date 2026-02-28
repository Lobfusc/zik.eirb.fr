import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
    allowedHosts: ['frontend'],
    hmr: {
      host: 'localhost', 
      protocol: 'ws', // wss HTTPS
      clientPort: 80,
      port: 5173,
    },
  }
})


