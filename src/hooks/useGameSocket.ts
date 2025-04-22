
import { GameState } from '@/types/game';
import { useSocketConnection } from './useSocketConnection';
import { useGameEvents } from './useGameEvents';
import { useGameActions } from './useGameActions';

interface GameSocketProps {
  onGameStateUpdate?: (gameState: GameState) => void;
}

const useGameSocket = ({ onGameStateUpdate }: GameSocketProps = {}) => {
  const { socket, connected, isConnecting, error, reconnect } = useSocketConnection();
  const { gameState, playerId, lobbyCode } = useGameEvents({ socket, onGameStateUpdate });
  const gameActions = useGameActions({ socket, lobbyCode });

  return {
    connected,
    gameState,
    playerId,
    lobbyCode,
    error,
    isConnecting,
    reconnect,
    ...gameActions
  };
};

export default useGameSocket;
