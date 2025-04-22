
// Determine the correct socket URL based on environment
export const SOCKET_URL = import.meta.env.VITE_SOCKET_SERVER_URL || 
  'https://kachu-server.onrender.com'; // Always use the Render URL since that's where the server is running

export const SOCKET_OPTIONS = {
  path: '/socket.io',
  transports: ['websocket', 'polling'], 
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  timeout: 60000,
  autoConnect: true,
  forceNew: false, // Change this to false to prevent creating new connections
  multiplex: true,  // Enable multiplexing so we reuse connections
};

// Enable debug mode for development - keep this on until we resolve all issues
export const DEBUG_MODE = true;
