
// Determine the correct socket URL based on environment
export const SOCKET_URL = import.meta.env.VITE_SOCKET_SERVER_URL || 
  (window.location.hostname === 'localhost' 
    ? 'http://localhost:3001' 
    : 'https://kachu-server.onrender.com');

export const SOCKET_OPTIONS = {
  path: '/socket.io',
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000,
  forceNew: true, // Force new connection on each connect
  multiplex: false, // Disable multiplexing to ensure clean connections
};

// Add debug mode for development
export const DEBUG_MODE = true; // Force debug mode on to help troubleshoot
