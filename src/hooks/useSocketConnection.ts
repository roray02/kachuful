
import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL, SOCKET_OPTIONS } from '@/config/socketConfig';
import { toast } from '@/components/ui/sonner';

export const useSocketConnection = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Connecting to game server at:', SOCKET_URL || window.location.origin);
    setIsConnecting(true);
    
    const socketInstance = io(SOCKET_URL || window.location.origin, SOCKET_OPTIONS);
    
    socketInstance.on('connect', () => {
      setConnected(true);
      setIsConnecting(false);
      setConnectionAttempts(0);
      console.log('Connected to game server with ID:', socketInstance.id);
    });
    
    socketInstance.on('disconnect', () => {
      setConnected(false);
      console.log('Disconnected from game server');
    });
    
    socketInstance.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setIsConnecting(false);
      setConnectionAttempts(prev => prev + 1);
      
      if (connectionAttempts > 3) {
        toast.error("Unable to connect to game server. Please try again later.");
      }
    });
    
    socketInstance.on('error', (data: { message: string }) => {
      setError(data.message);
      toast.error(data.message);
    });
    
    setSocket(socketInstance);
    
    return () => {
      socketInstance.disconnect();
    };
  }, [connectionAttempts]);

  return {
    socket,
    connected,
    isConnecting,
    error
  };
};

