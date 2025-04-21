
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import child_process from 'child_process'
import { componentTagger } from "lovable-tagger"
import type { ViteDevServer } from 'vite'

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    mode === 'development' && {
      name: 'game-server',
      configureServer(server: ViteDevServer) {
        // Only start the game server in development
        const gameServer = child_process.fork('./src/server/index.js', [], {
          stdio: 'inherit'
        });
        
        console.log('Started game server process');
        
        server.httpServer?.on('close', () => {
          console.log('Stopping game server process');
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
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    }
  }
}))
