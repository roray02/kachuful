
const { server, io } = require('./gameServer');

// This file is used to start the game server
const PORT = process.env.PORT || 3001;

// Make sure the server is listening on all interfaces
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Game server running on port ${PORT}`);
  console.log(`Server is listening on all interfaces (0.0.0.0)`);
});

// Log the io instance
console.log('Game server initialized with Socket.IO');

// Export the server and io for testing
module.exports = { server, io };
