
const { server } = require('./gameServer');

// This file is used to start the game server
const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Game server running on port ${PORT}`);
  console.log(`Server is listening on all interfaces (0.0.0.0)`);
});

console.log('Game server initialized');
