import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Required for Electron production builds: assets must use relative paths
  // so index.html can be loaded via file:// inside the packaged app.
  base: './',
  server: {
    port: 5173,
    strictPort: true, // fail instead of trying another port, so wait-on always knows where Vite is
  },
})
