
// Determine the correct socket URL based on environment
export const SOCKET_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001' 
  : import.meta.env.VITE_SOCKET_SERVER_URL || window.location.origin;

export const SOCKET_OPTIONS = {
  path: '/socket.io',
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000,
};
