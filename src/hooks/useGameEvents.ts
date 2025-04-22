
import { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { GameState } from '@/types/game';
import { toast } from '@/components/ui/sonner';
import { DEBUG_MODE } from '@/config/socketConfig';

interface UseGameEventsProps {
  socket: Socket | null;
  onGameStateUpdate?: (gameState: GameState) => void;
}

export const useGameEvents = ({ socket, onGameStateUpdate }: UseGameEventsProps) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [lobbyCode, setLobbyCode] = useState<string | null>(null);

  useEffect(() => {
    if (!socket) return;

    const handleGameStateUpdate = (updatedGameState: GameState) => {
      if (DEBUG_MODE) console.log('Game state updated:', updatedGameState);
      setGameState(updatedGameState);
      if (onGameStateUpdate) {
        onGameStateUpdate(updatedGameState);
      }
    };

    socket.on('gameStateUpdate', handleGameStateUpdate);
    
    socket.on('lobbyCreated', (data: { lobbyCode: string, playerId: string, gameState: GameState }) => {
      if (DEBUG_MODE) {
        console.log('Lobby created event received:', data);
        console.log('Lobby Code:', data.lobbyCode);
        console.log('Player ID:', data.playerId);
      }
      
      setLobbyCode(data.lobbyCode);
      setPlayerId(data.playerId);
      setGameState(data.gameState);
      
      if (onGameStateUpdate) {
        onGameStateUpdate(data.gameState);
      }
      
      toast.success(`Lobby created: ${data.lobbyCode}`);
    });
    
    socket.on('lobbyJoined', (data: { lobbyCode: string, playerId: string, gameState: GameState }) => {
      if (DEBUG_MODE) {
        console.log('Lobby joined event received:', data);
        console.log('Lobby Code:', data.lobbyCode);
        console.log('Player ID:', data.playerId);
      }
      
      setLobbyCode(data.lobbyCode);
      setPlayerId(data.playerId);
      setGameState(data.gameState);
      
      if (onGameStateUpdate) {
        onGameStateUpdate(data.gameState);
      }
      
      toast.success(`Joined lobby: ${data.lobbyCode}`);
    });
    
    socket.on('playerDisconnected', (data: { playerId: string }) => {
      if (DEBUG_MODE) console.log('Player disconnected:', data);
      toast.error(`A player has disconnected`);
    });
    
    // Add better error handling
    socket.on('error', (data: { message: string }) => {
      console.error('Game error:', data.message);
      toast.error(data.message);
    });

    // Handle reconnection events
    socket.on('reconnect', (attemptNumber: number) => {
      if (DEBUG_MODE) console.log(`Socket reconnected after ${attemptNumber} attempts`);
      toast.success('Reconnected to server!');
    });

    return () => {
      socket.off('gameStateUpdate');
      socket.off('lobbyCreated');
      socket.off('lobbyJoined');
      socket.off('playerDisconnected');
      socket.off('error');
      socket.off('reconnect');
    };
  }, [socket, onGameStateUpdate]);

  return {
    gameState,
    playerId,
    lobbyCode
  };
};
