
import { useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { toast } from '@/components/ui/sonner';
import { DEBUG_MODE } from '@/config/socketConfig';

interface UseGameActionsProps {
  socket: Socket | null;
  lobbyCode: string | null;
}

export interface CreateLobbyParams {
  playerName: string;
  maxRounds?: number;
}

export interface JoinLobbyParams {
  lobbyCode: string;
  playerName: string;
}

// Format lobby code consistently
const formatLobbyCode = (code: string): string => {
  return code.trim().toUpperCase();
};

export const useGameActions = ({ socket, lobbyCode }: UseGameActionsProps) => {
  const createLobby = useCallback(({ playerName, maxRounds = 10 }: CreateLobbyParams) => {
    if (!socket) {
      toast.error('Not connected to server');
      return;
    }
    
    if (!socket.connected) {
      toast.error('Socket is not connected');
      return;
    }
    
    if (DEBUG_MODE) {
      console.log('Creating lobby with player:', playerName);
      console.log('Socket connected status:', socket.connected);
      console.log('Socket ID:', socket.id);
    }
    
    // Use a small timeout to ensure socket is fully established
    setTimeout(() => {
      if (DEBUG_MODE) console.log('Emitting createLobby event now');
      
      // Verify socket is still connected before emitting
      if (socket.connected) {
        socket.emit('createLobby', { playerName, maxRounds });
      } else {
        toast.error('Lost connection to server');
      }
    }, 300);
  }, [socket]);

  const joinLobby = useCallback(({ lobbyCode, playerName }: JoinLobbyParams) => {
    if (!socket) {
      toast.error('Not connected to server');
      return;
    }
    
    if (!socket.connected) {
      toast.error('Socket is not connected');
      return;
    }
    
    // Format the lobby code consistently
    const formattedLobbyCode = formatLobbyCode(lobbyCode);
    
    if (DEBUG_MODE) {
      console.log(`Attempting to join lobby: ${formattedLobbyCode} as player: ${playerName}`);
      console.log('Socket connected status:', socket.connected);
      console.log('Socket ID:', socket.id);
    }
    
    // Use a small timeout to ensure socket is fully established
    setTimeout(() => {
      if (DEBUG_MODE) console.log('Emitting joinLobby event with data:', { lobbyCode: formattedLobbyCode, playerName });
      
      // Verify socket is still connected before emitting
      if (socket.connected) {
        socket.emit('joinLobby', { lobbyCode: formattedLobbyCode, playerName });
      } else {
        toast.error('Lost connection to server');
      }
    }, 300);
  }, [socket]);

  const startGame = useCallback(() => {
    if (!socket || !lobbyCode) {
      toast.error('Cannot start game');
      return;
    }
    
    if (!socket.connected) {
      toast.error('Socket is not connected');
      return;
    }
    
    if (DEBUG_MODE) console.log('Starting game in lobby:', lobbyCode);
    socket.emit('startGame', { lobbyCode });
  }, [socket, lobbyCode]);

  const makeBid = useCallback((bid: number) => {
    if (!socket || !lobbyCode) {
      toast.error('Cannot make bid');
      return;
    }
    
    if (!socket.connected) {
      toast.error('Socket is not connected');
      return;
    }
    
    socket.emit('makeBid', { lobbyCode, bid });
  }, [socket, lobbyCode]);

  const playCard = useCallback((cardId: string) => {
    if (!socket || !lobbyCode) {
      toast.error('Cannot play card');
      return;
    }
    
    if (!socket.connected) {
      toast.error('Socket is not connected');
      return;
    }
    
    socket.emit('playCard', { lobbyCode, cardId });
  }, [socket, lobbyCode]);

  const startNextRound = useCallback(() => {
    if (!socket || !lobbyCode) {
      toast.error('Cannot start next round');
      return;
    }
    
    if (!socket.connected) {
      toast.error('Socket is not connected');
      return;
    }
    
    socket.emit('startNextRound', { lobbyCode });
  }, [socket, lobbyCode]);

  return {
    createLobby,
    joinLobby,
    startGame,
    makeBid,
    playCard,
    startNextRound
  };
};
