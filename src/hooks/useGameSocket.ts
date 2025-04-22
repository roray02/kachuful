
import { useState, useEffect, useCallback, useRef } from 'react';
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
  
  // Store the current lobby code and player ID to localStorage for reconnection
  useEffect(() => {
    if (lobbyCode && playerId) {
      localStorage.setItem('kachuLastLobby', lobbyCode);
      localStorage.setItem('kachuLastPlayerId', playerId);
      
      if (DEBUG_MODE) console.log(`Stored lobby ${lobbyCode} and player ${playerId} to localStorage`);
    }
  }, [lobbyCode, playerId]);
  
  // Try to rejoin on initial load if we have cached lobby info
  useEffect(() => {
    const cachedLobbyCode = localStorage.getItem('kachuLastLobby');
    const cachedPlayerId = localStorage.getItem('kachuLastPlayerId');
    const cachedPlayerName = localStorage.getItem('kachuLastPlayerName');
    
    if (DEBUG_MODE) {
      console.log('Checking for cached lobby data:');
      console.log('Cached lobby:', cachedLobbyCode);
      console.log('Cached player ID:', cachedPlayerId);
      console.log('Cached player name:', cachedPlayerName);
    }
    
    // If we have cached lobby info and we're not already in a lobby
    if (cachedLobbyCode && cachedPlayerName && !lobbyCode && connected) {
      if (DEBUG_MODE) console.log(`Attempting to rejoin lobby ${cachedLobbyCode} as ${cachedPlayerName}`);
      
      // Try to rejoin with the cached info
      gameActions.joinLobby({
        lobbyCode: cachedLobbyCode,
        playerName: cachedPlayerName
      });
    }
  }, [connected, lobbyCode, gameActions]);
  
  // Enhanced join lobby function that tracks the attempt and stores player name
  const enhancedJoinLobby = useCallback((params: { lobbyCode: string; playerName: string }) => {
    const now = Date.now();
    if (DEBUG_MODE) console.log(`Join lobby attempt at ${now}:`, params);
    
    // Store join attempt with timestamp
    setLastJoinAttempt({
      ...params,
      timestamp: now
    });
    
    // Store player name for reconnection
    localStorage.setItem('kachuLastPlayerName', params.playerName);
    
    if (!connected) {
      toast.error('Not connected to server. Attempting to reconnect...');
      reconnect();
      return;
    }
    
    gameActions.joinLobby(params);
  }, [connected, gameActions, reconnect]);
  
  // Enhanced create lobby function that stores player name
  const enhancedCreateLobby = useCallback((params: { playerName: string; maxRounds?: number }) => {
    if (DEBUG_MODE) console.log('Create lobby attempt:', params);
    setLastJoinAttempt(null);
    
    // Store player name for reconnection
    localStorage.setItem('kachuLastPlayerName', params.playerName);
    
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
  
  // Periodically refresh game state (every 5 seconds)
  const refreshInterval = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // If we're in a lobby, set up periodic refresh
    if (connected && lobbyCode) {
      if (DEBUG_MODE) console.log('Setting up periodic game state refresh');
      
      // Clear any existing interval
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
      
      // Set up new interval to refresh game state
      refreshInterval.current = setInterval(() => {
        if (socket?.connected && lobbyCode) {
          if (DEBUG_MODE) console.log('Refreshing game state');
          socket.emit('getGameState', { lobbyCode });
        }
      }, 5000); // Refresh every 5 seconds
    }
    
    // Clean up interval on unmount or when disconnected
    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
        refreshInterval.current = null;
      }
    };
  }, [connected, lobbyCode, socket]);
  
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
