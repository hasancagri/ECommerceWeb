import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Dev proxy: tarayıcı same-origin (:5173) /api + /files çağırır, vite server-side gateway'e (5060)
// iletir. Tarayıcı gateway portunu HİÇ görmez → Chrome "unsafe port" (5060=SIP) bloğu + CORS derdi
// biter. Prod'da reverse-proxy aynı işi yapar.
const GATEWAY = 'http://localhost:5060'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': { target: GATEWAY, changeOrigin: true },
      '/files': { target: GATEWAY, changeOrigin: true },
    },
  },
})
