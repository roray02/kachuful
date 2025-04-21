
require('dotenv').config();
const { server, io } = require('./gameServer');

// Get port from environment variable or use default
const PORT = process.env.PORT || 3001;

// The server is already listening in gameServer.js, so we don't need to call listen again
// Just log that we're using the server that's already running
console.log(`Game server running on port ${PORT}`);
console.log('Server URL:', process.env.FRONTEND_URL || 'Development mode - accepting all origins');

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// Export the server and io instances for testing
module.exports = { server, io };
