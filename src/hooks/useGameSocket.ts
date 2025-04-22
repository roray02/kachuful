
import { useState, useEffect } from 'react';
import { GameState } from '@/types/game';
import { useSocketConnection } from './useSocketConnection';
import { useGameEvents } from './useGameEvents';
import { useGameActions } from './useGameActions';
import { DEBUG_MODE } from '@/config/socketConfig';

interface GameSocketProps {
  onGameStateUpdate?: (gameState: GameState) => void;
}

const useGameSocket = ({ onGameStateUpdate }: GameSocketProps = {}) => {
  const [lastJoinAttempt, setLastJoinAttempt] = useState<{
    lobbyCode: string;
    playerName: string;
  } | null>(null);
  
  const { socket, connected, isConnecting, error, reconnect } = useSocketConnection();
  const { gameState, playerId, lobbyCode } = useGameEvents({ socket, onGameStateUpdate });
  const gameActions = useGameActions({ socket, lobbyCode });
  
  // Enhanced join lobby function that tracks the attempt
  const enhancedJoinLobby = (params: { lobbyCode: string; playerName: string }) => {
    setLastJoinAttempt(params);
    gameActions.joinLobby(params);
  };
  
  // Enhanced create lobby function
  const enhancedCreateLobby = (params: { playerName: string; maxRounds?: number }) => {
    setLastJoinAttempt(null);
    gameActions.createLobby(params);
  };
  
  // Retry join if connection was restored
  useEffect(() => {
    if (connected && lastJoinAttempt && !lobbyCode) {
      if (DEBUG_MODE) console.log('Retrying previous join attempt:', lastJoinAttempt);
      setTimeout(() => {
        gameActions.joinLobby(lastJoinAttempt);
      }, 500);
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
