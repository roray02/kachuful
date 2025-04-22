
import { useState, useEffect, useCallback } from 'react';
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

  // Handler for game state update
  const handleGameStateUpdate = useCallback((updatedGameState: GameState) => {
    if (DEBUG_MODE) console.log('Game state updated:', updatedGameState);
    setGameState(updatedGameState);
    if (onGameStateUpdate) {
      onGameStateUpdate(updatedGameState);
    }
  }, [onGameStateUpdate]);

  useEffect(() => {
    if (!socket) return;

    // Set up all socket event listeners
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
    
    socket.on('playerJoined', (data: { playerId: string, playerName: string, gameState: GameState }) => {
      if (DEBUG_MODE) console.log('Player joined:', data);
      toast.success(`${data.playerName} joined the game`);
      
      // Update game state to show new player
      setGameState(data.gameState);
      
      if (onGameStateUpdate) {
        onGameStateUpdate(data.gameState);
      }
    });
    
    socket.on('playerDisconnected', (data: { playerId: string, gameState: GameState }) => {
      if (DEBUG_MODE) console.log('Player disconnected:', data);
      toast.error(`A player has disconnected`);
      
      // Update game state to reflect disconnected player
      setGameState(data.gameState);
      
      if (onGameStateUpdate) {
        onGameStateUpdate(data.gameState);
      }
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
      
      // If we have a lobby code, request the current game state
      if (lobbyCode) {
        socket.emit('getGameState', { lobbyCode });
      }
    });

    return () => {
      socket.off('gameStateUpdate');
      socket.off('lobbyCreated');
      socket.off('lobbyJoined');
      socket.off('playerJoined');
      socket.off('playerDisconnected');
      socket.off('error');
      socket.off('reconnect');
    };
  }, [socket, onGameStateUpdate, handleGameStateUpdate, lobbyCode]);

  return {
    gameState,
    playerId,
    lobbyCode
  };
};
