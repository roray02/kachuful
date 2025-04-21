
import { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { GameState } from '@/types/game';
import { toast } from '@/components/ui/sonner';

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
    
    socket.on('playerDisconnected', () => {
      toast.error(`A player has disconnected`);
    });

    return () => {
      socket.off('gameStateUpdate');
      socket.off('lobbyCreated');
      socket.off('lobbyJoined');
      socket.off('playerDisconnected');
    };
  }, [socket, onGameStateUpdate]);

  return {
    gameState,
    playerId,
    lobbyCode
  };
};

