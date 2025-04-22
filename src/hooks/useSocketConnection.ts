
import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL, SOCKET_OPTIONS } from '@/config/socketConfig';
import { toast } from '@/components/ui/sonner';

export const useSocketConnection = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  
  useEffect(() => {
    console.log('Connecting to game server at:', SOCKET_URL);
    setIsConnecting(true);
    
    // Clean up previous socket if it exists
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    
    const socketInstance = io(SOCKET_URL, {
      ...SOCKET_OPTIONS,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });
    
    socketRef.current = socketInstance;
    
    socketInstance.on('connect', () => {
      setConnected(true);
      setIsConnecting(false);
      setConnectionAttempts(0);
      setError(null);
      console.log('Connected to game server with ID:', socketInstance.id);
      toast.success('Connected to game server!');
    });
    
    socketInstance.on('disconnect', () => {
      setConnected(false);
      console.log('Disconnected from game server');
    });
    
    socketInstance.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      setIsConnecting(false);
      setConnectionAttempts(prev => prev + 1);
      setError(`Connection error: ${err.message}`);
      
      if (connectionAttempts > 2) {
        toast.error("Unable to connect to game server. Please try again later.");
      }
    });
    
    socketInstance.on('error', (data: { message: string }) => {
      setError(data.message);
      toast.error(data.message);
    });
    
    setSocket(socketInstance);
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // Add manual reconnect function
  const reconnect = () => {
    setConnectionAttempts(0);
    setIsConnecting(true);
    setError(null);
    
    if (socketRef.current) {
      socketRef.current.connect();
    }
  };

  return {
    socket,
    connected,
    isConnecting,
    error,
    reconnect
  };
};
