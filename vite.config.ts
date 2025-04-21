
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import child_process from 'child_process'
import { componentTagger } from "lovable-tagger"
import type { ViteDevServer } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    {
      name: 'game-server',
      configureServer(server: ViteDevServer) {
        // Start the game server when Vite starts
        const gameServer = child_process.fork('./src/server/index.js', [], {
          stdio: 'inherit'
        });
        
        server.httpServer?.on('close', () => {
          // Shutdown the game server when Vite stops
          gameServer.kill();
        });
      }
    }
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/socket.io': {
        target: 'http://localhost:3001',
        ws: true,
        changeOrigin: true
      }
    }
  }
}))
