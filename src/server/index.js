
const { server } = require('./gameServer');

// This file is used to start the game server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Game server running on port ${PORT}`);
});

console.log('Game server initialized');
