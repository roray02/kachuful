
// Determine the correct socket URL based on environment
export const SOCKET_URL = import.meta.env.VITE_SOCKET_SERVER_URL || 
  'https://kachu-server.onrender.com'; // Always use the Render URL since that's where the server is running

export const SOCKET_OPTIONS = {
  path: '/socket.io',
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 30000,
  forceNew: true,
  multiplex: false,
};

// Enable debug mode for development
export const DEBUG_MODE = true; // Keep debug mode on for troubleshooting
