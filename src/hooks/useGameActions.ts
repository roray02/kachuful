
import { useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { toast } from '@/components/ui/sonner';

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

export const useGameActions = ({ socket, lobbyCode }: UseGameActionsProps) => {
  const createLobby = useCallback(({ playerName, maxRounds = 10 }: CreateLobbyParams) => {
    if (!socket) {
      toast.error('Not connected to server');
      return;
    }
    socket.emit('createLobby', { playerName, maxRounds });
  }, [socket]);

  const joinLobby = useCallback(({ lobbyCode, playerName }: JoinLobbyParams) => {
    if (!socket) {
      toast.error('Not connected to server');
      return;
    }
    socket.emit('joinLobby', { lobbyCode, playerName });
  }, [socket]);

  const startGame = useCallback(() => {
    if (!socket || !lobbyCode) {
      toast.error('Cannot start game');
      return;
    }
    socket.emit('startGame', { lobbyCode });
  }, [socket, lobbyCode]);

  const makeBid = useCallback((bid: number) => {
    if (!socket || !lobbyCode) {
      toast.error('Cannot make bid');
      return;
    }
    socket.emit('makeBid', { lobbyCode, bid });
  }, [socket, lobbyCode]);

  const playCard = useCallback((cardId: string) => {
    if (!socket || !lobbyCode) {
      toast.error('Cannot play card');
      return;
    }
    socket.emit('playCard', { lobbyCode, cardId });
  }, [socket, lobbyCode]);

  const startNextRound = useCallback(() => {
    if (!socket || !lobbyCode) {
      toast.error('Cannot start next round');
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
