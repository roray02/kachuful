
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import child_process from 'child_process'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'game-server',
      configureServer(server) {
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
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  server: {
    port: 8080,
    proxy: {
      '/socket.io': {
        target: 'http://localhost:3001',
        ws: true,
      }
    }
  }
})
