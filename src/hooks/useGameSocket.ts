
import { useState, useEffect, useCallback } from 'react';
import { GameState } from '@/types/game';
import { useSocketConnection } from './useSocketConnection';
import { useGameEvents } from './useGameEvents';
import { useGameActions } from './useGameActions';
import { DEBUG_MODE } from '@/config/socketConfig';
import { toast } from '@/components/ui/sonner';

interface GameSocketProps {
  onGameStateUpdate?: (gameState: GameState) => void;
}

const useGameSocket = ({ onGameStateUpdate }: GameSocketProps = {}) => {
  const { socket, connected, isConnecting, error, reconnect } = useSocketConnection();
  const { gameState, playerId, lobbyCode } = useGameEvents({ socket, onGameStateUpdate });
  const gameActions = useGameActions({ socket, lobbyCode });
  
  const [lastJoinAttempt, setLastJoinAttempt] = useState<{
    lobbyCode: string;
    playerName: string;
    timestamp: number;
  } | null>(null);
  
  // Enhanced join lobby function that tracks the attempt
  const enhancedJoinLobby = useCallback((params: { lobbyCode: string; playerName: string }) => {
    const now = Date.now();
    if (DEBUG_MODE) console.log(`Join lobby attempt at ${now}:`, params);
    
    // Store join attempt with timestamp
    setLastJoinAttempt({
      ...params,
      timestamp: now
    });
    
    if (!connected) {
      toast.error('Not connected to server. Attempting to reconnect...');
      reconnect();
      return;
    }
    
    gameActions.joinLobby(params);
  }, [connected, gameActions, reconnect]);
  
  // Enhanced create lobby function
  const enhancedCreateLobby = useCallback((params: { playerName: string; maxRounds?: number }) => {
    if (DEBUG_MODE) console.log('Create lobby attempt:', params);
    setLastJoinAttempt(null);
    
    if (!connected) {
      toast.error('Not connected to server. Attempting to reconnect...');
      reconnect();
      return;
    }
    
    // Log the socket state to debug
    if (DEBUG_MODE && socket) {
      console.log('Socket connected status:', socket.connected);
      console.log('Socket ID:', socket.id);
    }
    
    gameActions.createLobby(params);
  }, [connected, gameActions, reconnect, socket]);
  
  // Retry join if connection was restored
  useEffect(() => {
    if (connected && lastJoinAttempt && !lobbyCode) {
      const timeSinceLastAttempt = Date.now() - lastJoinAttempt.timestamp;
      
      // Only retry if the last attempt was recent (within the last 10 seconds)
      if (timeSinceLastAttempt < 10000) {
        if (DEBUG_MODE) console.log('Retrying previous join attempt:', lastJoinAttempt);
        
        // Add a small delay to ensure connection is fully established
        setTimeout(() => {
          gameActions.joinLobby({
            lobbyCode: lastJoinAttempt.lobbyCode,
            playerName: lastJoinAttempt.playerName
          });
        }, 1000);
      }
    }
  }, [connected, lastJoinAttempt, lobbyCode, gameActions]);

  return {
    connected,
    gameState,
    playerId,
    lobbyCode,
    error,
    isConnecting,
    reconnect,
    joinLobby: enhancedJoinLobby,
    createLobby: enhancedCreateLobby,
    ...gameActions,
  };
};

export default useGameSocket;
