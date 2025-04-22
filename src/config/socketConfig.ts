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
  forceNew: true,
  multiplex: false,
};

// Add redirect URL to use when needed
export const PUBLIC_URL = import.meta.env.VITE_PUBLIC_URL || 
  window.location.origin;

// Enable debug mode for development - keep this on until we resolve all issues
export const DEBUG_MODE = true;
