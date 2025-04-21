import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState } from '@/types/game';
import { toast } from '@/components/ui/sonner';

// Determine the correct socket URL based on environment
// Using relative URL for production and absolute for local development
const SOCKET_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001' 
  : '';

interface GameSocketProps {
  onGameStateUpdate?: (gameState: GameState) => void;
}

interface CreateLobbyParams {
  playerName: string;
  maxRounds?: number;
}

interface JoinLobbyParams {
  lobbyCode: string;
  playerName: string;
}

const useGameSocket = ({ onGameStateUpdate }: GameSocketProps = {}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [lobbyCode, setLobbyCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    console.log('Connecting to game server at:', SOCKET_URL || window.location.origin);
    setIsConnecting(true);
    
    // Create socket with explicit URL and options
    const socketInstance = io(SOCKET_URL || window.location.origin, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    });
    
    socketInstance.on('connect', () => {
      setConnected(true);
      setIsConnecting(false);
      setConnectionAttempts(0);
      console.log('Connected to game server with ID:', socketInstance.id);
    });
    
    socketInstance.on('disconnect', () => {
      setConnected(false);
      console.log('Disconnected from game server');
    });
    
    socketInstance.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setIsConnecting(false);
      setConnectionAttempts(prev => prev + 1);
      
      if (connectionAttempts > 3) {
        toast.error("Unable to connect to game server. Please try again later.");
      }
    });
    
    socketInstance.on('error', (data: { message: string }) => {
      setError(data.message);
      toast.error(data.message);
    });
    
    setSocket(socketInstance);
    
    return () => {
      socketInstance.disconnect();
    };
  }, [connectionAttempts]);
  
  // Game state updates
  useEffect(() => {
    if (!socket) return;
    
    const handleGameStateUpdate = (updatedGameState: GameState) => {
      setGameState(updatedGameState);
      
      if (onGameStateUpdate) {
        onGameStateUpdate(updatedGameState);
      }
    };
    
    socket.on('gameStateUpdate', handleGameStateUpdate);
    
    socket.on('lobbyCreated', (data: { lobbyCode: string, playerId: string, gameState: GameState }) => {
      setLobbyCode(data.lobbyCode);
      setPlayerId(data.playerId);
      setGameState(data.gameState);
      
      if (onGameStateUpdate) {
        onGameStateUpdate(data.gameState);
      }
      
      toast.success(`Lobby created: ${data.lobbyCode}`);
    });
    
    socket.on('lobbyJoined', (data: { lobbyCode: string, playerId: string, gameState: GameState }) => {
      setLobbyCode(data.lobbyCode);
      setPlayerId(data.playerId);
      setGameState(data.gameState);
      
      if (onGameStateUpdate) {
        onGameStateUpdate(data.gameState);
      }
      
      toast.success(`Joined lobby: ${data.lobbyCode}`);
    });
    
    socket.on('playerDisconnected', (data: { playerId: string }) => {
      toast.error(`A player has disconnected`);
    });
    
    return () => {
      socket.off('gameStateUpdate');
      socket.off('lobbyCreated');
      socket.off('lobbyJoined');
      socket.off('playerDisconnected');
    };
  }, [socket, onGameStateUpdate]);
  
  // Create a new lobby
  const createLobby = useCallback(({ playerName, maxRounds = 10 }: CreateLobbyParams) => {
    if (!socket) {
      setError('Not connected to server');
      toast.error('Not connected to server');
      return;
    }
    
    socket.emit('createLobby', { playerName, maxRounds });
  }, [socket]);
  
  // Join an existing lobby
  const joinLobby = useCallback(({ lobbyCode, playerName }: JoinLobbyParams) => {
    if (!socket) {
      setError('Not connected to server');
      toast.error('Not connected to server');
      return;
    }
    
    socket.emit('joinLobby', { lobbyCode, playerName });
  }, [socket]);
  
  // Start the game
  const startGame = useCallback(() => {
    if (!socket || !lobbyCode) {
      setError('Cannot start game');
      toast.error('Cannot start game');
      return;
    }
    
    socket.emit('startGame', { lobbyCode });
  }, [socket, lobbyCode]);
  
  // Make a bid
  const makeBid = useCallback((bid: number) => {
    if (!socket || !lobbyCode) {
      setError('Cannot make bid');
      toast.error('Cannot make bid');
      return;
    }
    
    socket.emit('makeBid', { lobbyCode, bid });
  }, [socket, lobbyCode]);
  
  // Play a card
  const playCard = useCallback((cardId: string) => {
    if (!socket || !lobbyCode) {
      setError('Cannot play card');
      toast.error('Cannot play card');
      return;
    }
    
    socket.emit('playCard', { lobbyCode, cardId });
  }, [socket, lobbyCode]);
  
  // Start next round
  const startNextRound = useCallback(() => {
    if (!socket || !lobbyCode) {
      setError('Cannot start next round');
      toast.error('Cannot start next round');
      return;
    }
    
    socket.emit('startNextRound', { lobbyCode });
  }, [socket, lobbyCode]);
  
  return {
    connected,
    gameState,
    playerId,
    lobbyCode,
    error,
    isConnecting,
    createLobby,
    joinLobby,
    startGame,
    makeBid,
    playCard,
    startNextRound
  };
};

export default useGameSocket;
