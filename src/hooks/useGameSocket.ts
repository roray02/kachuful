
import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState } from '@/types/game';
import { toast } from '@/components/ui/sonner';

const SERVER_URL = 'http://localhost:3001';

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

  // Initialize socket connection
  useEffect(() => {
    const socketInstance = io(SERVER_URL);
    
    socketInstance.on('connect', () => {
      setConnected(true);
      console.log('Connected to game server');
    });
    
    socketInstance.on('disconnect', () => {
      setConnected(false);
      console.log('Disconnected from game server');
    });
    
    socketInstance.on('error', (data: { message: string }) => {
      setError(data.message);
      toast.error(data.message);
    });
    
    setSocket(socketInstance);
    
    return () => {
      socketInstance.disconnect();
    };
  }, []);
  
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
    if (!socket || !connected) {
      setError('Not connected to server');
      toast.error('Not connected to server');
      return;
    }
    
    socket.emit('createLobby', { playerName, maxRounds });
  }, [socket, connected]);
  
  // Join an existing lobby
  const joinLobby = useCallback(({ lobbyCode, playerName }: JoinLobbyParams) => {
    if (!socket || !connected) {
      setError('Not connected to server');
      toast.error('Not connected to server');
      return;
    }
    
    socket.emit('joinLobby', { lobbyCode, playerName });
  }, [socket, connected]);
  
  // Start the game
  const startGame = useCallback(() => {
    if (!socket || !connected || !lobbyCode) {
      setError('Cannot start game');
      toast.error('Cannot start game');
      return;
    }
    
    socket.emit('startGame', { lobbyCode });
  }, [socket, connected, lobbyCode]);
  
  // Make a bid
  const makeBid = useCallback((bid: number) => {
    if (!socket || !connected || !lobbyCode) {
      setError('Cannot make bid');
      toast.error('Cannot make bid');
      return;
    }
    
    socket.emit('makeBid', { lobbyCode, bid });
  }, [socket, connected, lobbyCode]);
  
  // Play a card
  const playCard = useCallback((cardId: string) => {
    if (!socket || !connected || !lobbyCode) {
      setError('Cannot play card');
      toast.error('Cannot play card');
      return;
    }
    
    socket.emit('playCard', { lobbyCode, cardId });
  }, [socket, connected, lobbyCode]);
  
  // Start next round
  const startNextRound = useCallback(() => {
    if (!socket || !connected || !lobbyCode) {
      setError('Cannot start next round');
      toast.error('Cannot start next round');
      return;
    }
    
    socket.emit('startNextRound', { lobbyCode });
  }, [socket, connected, lobbyCode]);
  
  return {
    connected,
    gameState,
    playerId,
    lobbyCode,
    error,
    createLobby,
    joinLobby,
    startGame,
    makeBid,
    playCard,
    startNextRound
  };
};

export default useGameSocket;
