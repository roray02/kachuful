const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { createDeck, shuffleDeck, dealCards, determineTrickWinner, calculateScore } = require('../utils/cardUtils');

// Initialize Express app and HTTP server
const app = express();

// Enable CORS for all routes
app.use(cors());

const server = http.createServer(app);

// Initialize Socket.IO with CORS configuration
const io = new Server(server, {
  cors: {
    // In production, this should be your frontend URL
    // In development, it allows connections from all origins
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["*"]
  },
  // Configure transport options
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('Game server is running');
});

// Add a root endpoint for easy checking
app.get('/', (req, res) => {
  res.status(200).send('Game server is running');
});

// In-memory game state
const lobbies = new Map();
const playerSockets = new Map(); // Track player socket connections

// Generate a random lobby code
const generateLobbyCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Initialize a new game state
const createNewGame = (lobbyCode, hostId, hostName, maxRounds = 10) => {
  return {
    lobbyCode,
    gameId: lobbyCode,
    phase: "waiting",
    players: [
      {
        id: hostId,
        name: hostName,
        isHost: true,
        isConnected: true,
        cards: [],
        tricks: 0,
        score: 0,
        isDealer: true,
        isCurrentTurn: false,
        bid: undefined
      }
    ],
    round: 1,
    maxRounds,
    cardsPerRound: 5,
    dealerIndex: 0,
    currentPlayerIndex: 0,
    currentTrick: { cards: [] },
    pastTricks: [],
    roundSummary: undefined,
    trump: undefined
  };
};

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Create a new lobby
  socket.on('createLobby', ({ playerName, maxRounds = 10 }) => {
    try {
      const lobbyCode = generateLobbyCode();
      const playerId = socket.id;
      
      // Create new game state
      const gameState = createNewGame(lobbyCode, playerId, playerName, maxRounds);
      
      // Store game state
      lobbies.set(lobbyCode, gameState);
      
      // Track player socket
      playerSockets.set(playerId, { socketId: socket.id, lobbyCode });
      
      // Join socket.io room
      socket.join(lobbyCode);
      
      // Send lobby info back to client
      socket.emit('lobbyCreated', { 
        lobbyCode, 
        playerId,
        gameState
      });
      
      console.log(`Lobby created: ${lobbyCode} by ${playerName}`);
    } catch (error) {
      console.error('Error creating lobby:', error);
      socket.emit('error', { message: 'Failed to create lobby' });
    }
  });

  // Join an existing lobby
  socket.on('joinLobby', ({ lobbyCode, playerName }) => {
    try {
      const playerId = socket.id;
      lobbyCode = lobbyCode.toUpperCase();
      
      // Check if lobby exists
      if (!lobbies.has(lobbyCode)) {
        socket.emit('error', { message: 'Lobby not found' });
        return;
      }
      
      // Get game state
      const gameState = lobbies.get(lobbyCode);
      
      // Check if game already started
      if (gameState.phase !== "waiting") {
        socket.emit('error', { message: 'Game already in progress' });
        return;
      }
      
      // Add new player
      const newPlayer = {
        id: playerId,
        name: playerName,
        isHost: false,
        isConnected: true,
        cards: [],
        tricks: 0,
        score: 0,
        isDealer: false,
        isCurrentTurn: false,
        bid: undefined
      };
      
      gameState.players.push(newPlayer);
      
      // Track player socket
      playerSockets.set(playerId, { socketId: socket.id, lobbyCode });
      
      // Join socket.io room
      socket.join(lobbyCode);
      
      // Update all clients
      io.to(lobbyCode).emit('gameStateUpdate', gameState);
      
      // Send join confirmation
      socket.emit('lobbyJoined', { 
        lobbyCode, 
        playerId,
        gameState
      });
      
      console.log(`Player ${playerName} joined lobby ${lobbyCode}`);
    } catch (error) {
      console.error('Error joining lobby:', error);
      socket.emit('error', { message: 'Failed to join lobby' });
    }
  });

  // Start the game
  socket.on('startGame', ({ lobbyCode }) => {
    try {
      // Check if lobby exists
      if (!lobbies.has(lobbyCode)) {
        socket.emit('error', { message: 'Lobby not found' });
        return;
      }
      
      // Get game state
      const gameState = lobbies.get(lobbyCode);
      
      // Check if requester is host
      const player = gameState.players.find(p => p.id === socket.id);
      if (!player || !player.isHost) {
        socket.emit('error', { message: 'Only the host can start the game' });
        return;
      }
      
      // Check if enough players
      if (gameState.players.length < 3) {
        socket.emit('error', { message: 'Need at least 3 players to start' });
        return;
      }
      
      // Deal cards
      const deck = shuffleDeck(createDeck());
      const hands = dealCards(deck, gameState.players.length, gameState.cardsPerRound);
      
      // Update player cards and turn state
      gameState.players.forEach((player, index) => {
        player.cards = hands[index];
        player.isCurrentTurn = index === (gameState.dealerIndex + 1) % gameState.players.length;
      });
      
      // Update game phase
      gameState.phase = "bidding";
      gameState.currentPlayerIndex = (gameState.dealerIndex + 1) % gameState.players.length;
      
      // Select trump suit randomly
      const suits = ["hearts", "diamonds", "clubs", "spades"];
      gameState.trump = suits[Math.floor(Math.random() * suits.length)];
      
      // Update all clients
      io.to(lobbyCode).emit('gameStateUpdate', gameState);
      
      console.log(`Game started in lobby ${lobbyCode}`);
    } catch (error) {
      console.error('Error starting game:', error);
      socket.emit('error', { message: 'Failed to start game' });
    }
  });

  // Make a bid
  socket.on('makeBid', ({ lobbyCode, bid }) => {
    try {
      // Check if lobby exists
      if (!lobbies.has(lobbyCode)) {
        socket.emit('error', { message: 'Lobby not found' });
        return;
      }
      
      // Get game state
      const gameState = lobbies.get(lobbyCode);
      
      // Check if game is in bidding phase
      if (gameState.phase !== "bidding") {
        socket.emit('error', { message: 'Game is not in bidding phase' });
        return;
      }
      
      // Check if it's player's turn
      const playerIndex = gameState.players.findIndex(p => p.id === socket.id);
      if (playerIndex === -1 || playerIndex !== gameState.currentPlayerIndex) {
        socket.emit('error', { message: 'Not your turn' });
        return;
      }
      
      // Calculate total bids
      const totalBidsMade = gameState.players.reduce(
        (total, player) => total + (player.bid ?? 0),
        0
      );
      
      // For dealer, check if bid makes total equal to tricks
      const isDealer = playerIndex === gameState.dealerIndex;
      if (isDealer && (totalBidsMade + bid) === gameState.cardsPerRound) {
        socket.emit('error', { message: "Dealer's bid cannot make total equal to tricks" });
        return;
      }
      
      // Make the bid
      gameState.players[playerIndex].bid = bid;
      gameState.players[playerIndex].isCurrentTurn = false;
      
      // Find the next player to bid
      let nextPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
      
      // Check if all players have bid
      const allPlayersBid = gameState.players.every(player => player.bid !== undefined);
      
      if (allPlayersBid) {
        // Move to playing phase
        gameState.phase = "playing";
        nextPlayerIndex = (gameState.dealerIndex + 1) % gameState.players.length;
      }
      
      // Update next player's turn
      gameState.players.forEach((player, index) => {
        player.isCurrentTurn = index === nextPlayerIndex;
      });
      
      gameState.currentPlayerIndex = nextPlayerIndex;
      
      // Update all clients
      io.to(lobbyCode).emit('gameStateUpdate', gameState);
      
      console.log(`Player ${gameState.players[playerIndex].name} bid ${bid}`);
    } catch (error) {
      console.error('Error making bid:', error);
      socket.emit('error', { message: 'Failed to make bid' });
    }
  });

  // Play a card
  socket.on('playCard', ({ lobbyCode, cardId }) => {
    try {
      // Check if lobby exists
      if (!lobbies.has(lobbyCode)) {
        socket.emit('error', { message: 'Lobby not found' });
        return;
      }
      
      // Get game state
      const gameState = lobbies.get(lobbyCode);
      
      // Check if game is in playing phase
      if (gameState.phase !== "playing") {
        socket.emit('error', { message: 'Game is not in playing phase' });
        return;
      }
      
      // Check if it's player's turn
      const playerIndex = gameState.players.findIndex(p => p.id === socket.id);
      if (playerIndex === -1 || playerIndex !== gameState.currentPlayerIndex) {
        socket.emit('error', { message: 'Not your turn' });
        return;
      }
      
      // Find the card in player's hand
      const player = gameState.players[playerIndex];
      const cardIndex = player.cards.findIndex(c => c.id === cardId);
      
      if (cardIndex === -1) {
        socket.emit('error', { message: 'Card not found in hand' });
        return;
      }
      
      const card = player.cards[cardIndex];
      
      // Check if card can be played (follow suit if possible)
      if (gameState.currentTrick.leadSuit) {
        const hasLeadSuit = player.cards.some(c => c.suit === gameState.currentTrick.leadSuit);
        if (hasLeadSuit && card.suit !== gameState.currentTrick.leadSuit) {
          socket.emit('error', { message: 'Must follow lead suit' });
          return;
        }
      }
      
      // Remove card from player's hand
      player.cards.splice(cardIndex, 1);
      player.isCurrentTurn = false;
      
      // Add card to current trick
      gameState.currentTrick.cards.push({ playerId: player.id, card });
      
      // Set lead suit if this is the first card
      if (!gameState.currentTrick.leadSuit) {
        gameState.currentTrick.leadSuit = card.suit;
      }
      
      // Check if trick is complete
      if (gameState.currentTrick.cards.length === gameState.players.length) {
        // Determine winner
        const winnerId = determineTrickWinner(
          gameState.currentTrick.cards,
          gameState.currentTrick.leadSuit,
          gameState.trump
        );
        
        gameState.currentTrick.winnerId = winnerId;
        
        // Increment winner's trick count
        const winner = gameState.players.find(p => p.id === winnerId);
        if (winner) {
          winner.tricks += 1;
        }
        
        // Move trick to past tricks
        gameState.pastTricks.push({...gameState.currentTrick});
        
        // Check if round is over
        const allCardsPlayed = gameState.players.every(p => p.cards.length === 0);
        
        if (allCardsPlayed) {
          // Calculate scores
          gameState.players.forEach(player => {
            const roundScore = calculateScore(player.bid, player.tricks);
            player.score += roundScore;
          });
          
          // Prepare round summary
          gameState.roundSummary = {
            playerResults: gameState.players.map(player => ({
              playerId: player.id,
              name: player.name,
              bid: player.bid,
              tricks: player.tricks,
              roundScore: calculateScore(player.bid, player.tricks),
              totalScore: player.score,
            })),
          };
          
          // Move to round end phase
          gameState.phase = "roundEnd";
          
        } else {
          // Start new trick
          const winnerIndex = gameState.players.findIndex(p => p.id === winnerId);
          
          // Update turn
          gameState.players.forEach((p, i) => {
            p.isCurrentTurn = i === winnerIndex;
          });
          
          gameState.currentPlayerIndex = winnerIndex;
          
          // Reset current trick
          gameState.currentTrick = { cards: [] };
        }
      } else {
        // Move to next player
        const nextPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
        
        // Update turn
        gameState.players.forEach((p, i) => {
          p.isCurrentTurn = i === nextPlayerIndex;
        });
        
        gameState.currentPlayerIndex = nextPlayerIndex;
      }
      
      // Update all clients
      io.to(lobbyCode).emit('gameStateUpdate', gameState);
      
      console.log(`Player ${player.name} played a card: ${card.suit} ${card.value}`);
    } catch (error) {
      console.error('Error playing card:', error);
      socket.emit('error', { message: 'Failed to play card' });
    }
  });

  // Start next round
  socket.on('startNextRound', ({ lobbyCode }) => {
    try {
      // Check if lobby exists
      if (!lobbies.has(lobbyCode)) {
        socket.emit('error', { message: 'Lobby not found' });
        return;
      }
      
      // Get game state
      const gameState = lobbies.get(lobbyCode);
      
      // Check if game is in round end phase
      if (gameState.phase !== "roundEnd") {
        socket.emit('error', { message: 'Game is not in round end phase' });
        return;
      }
      
      // Rotate dealer
      gameState.dealerIndex = (gameState.dealerIndex + 1) % gameState.players.length;
      
      // Reset player states
      gameState.players.forEach((player, index) => {
        player.bid = undefined;
        player.tricks = 0;
        player.isDealer = index === gameState.dealerIndex;
        player.isCurrentTurn = index === (gameState.dealerIndex + 1) % gameState.players.length;
      });
      
      // Deal new cards
      const deck = shuffleDeck(createDeck());
      
      // For variation, either increase or decrease cards per round
      if (gameState.round % 2 === 0 && gameState.cardsPerRound > 1) {
        gameState.cardsPerRound -= 1;
      } else if (gameState.round % 2 === 1 && gameState.cardsPerRound < 10) {
        gameState.cardsPerRound += 1;
      }
      
      const hands = dealCards(deck, gameState.players.length, gameState.cardsPerRound);
      
      gameState.players.forEach((player, index) => {
        player.cards = hands[index];
      });
      
      // Update game state
      gameState.round += 1;
      gameState.currentPlayerIndex = (gameState.dealerIndex + 1) % gameState.players.length;
      gameState.phase = "bidding";
      gameState.currentTrick = { cards: [] };
      gameState.pastTricks = [];
      gameState.roundSummary = undefined;
      
      // Change trump suit
      const suits = ["hearts", "diamonds", "clubs", "spades"];
      gameState.trump = suits[Math.floor(Math.random() * suits.length)];
      
      // Check if game is over (reached max rounds)
      if (gameState.round > gameState.maxRounds) {
        gameState.phase = "gameOver";
        
        // Sort players by score
        gameState.players.sort((a, b) => b.score - a.score);
        
        // Announce winner
        const winner = gameState.players[0];
        gameState.winner = winner;
      }
      
      // Update all clients
      io.to(lobbyCode).emit('gameStateUpdate', gameState);
      
      console.log(`Starting round ${gameState.round} in lobby ${lobbyCode}`);
    } catch (error) {
      console.error('Error starting next round:', error);
      socket.emit('error', { message: 'Failed to start next round' });
    }
  });

  // Handle disconnections
  socket.on('disconnect', () => {
    try {
      const playerId = socket.id;
      const playerData = playerSockets.get(playerId);
      
      if (playerData) {
        const { lobbyCode } = playerData;
        
        if (lobbies.has(lobbyCode)) {
          const gameState = lobbies.get(lobbyCode);
          
          // Update player connection status
          const playerIndex = gameState.players.findIndex(p => p.id === playerId);
          
          if (playerIndex !== -1) {
            gameState.players[playerIndex].isConnected = false;
            
            // Check if all players disconnected
            const allDisconnected = gameState.players.every(p => !p.isConnected);
            
            if (allDisconnected) {
              // Remove lobby if all players disconnected
              lobbies.delete(lobbyCode);
              console.log(`Lobby ${lobbyCode} removed - all players disconnected`);
            } else {
              // If host disconnected, assign new host
              if (gameState.players[playerIndex].isHost) {
                const newHostIndex = gameState.players.findIndex(p => p.id !== playerId && p.isConnected);
                
                if (newHostIndex !== -1) {
                  gameState.players[newHostIndex].isHost = true;
                }
              }
              
              // Update game state for remaining players
              io.to(lobbyCode).emit('gameStateUpdate', gameState);
              io.to(lobbyCode).emit('playerDisconnected', { playerId });
            }
          }
        }
        
        // Remove player from tracking
        playerSockets.delete(playerId);
      }
      
      console.log(`Client disconnected: ${socket.id}`);
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });
});

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Game server running on port ${PORT}`);
});

// Export for use in index.js
module.exports = { server, io };
