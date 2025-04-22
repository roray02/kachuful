
import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL, SOCKET_OPTIONS, DEBUG_MODE } from '@/config/socketConfig';
import { toast } from '@/components/ui/sonner';

export const useSocketConnection = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  
  const connectToSocket = useCallback(() => {
    if (DEBUG_MODE) console.log('Connecting to game server at:', SOCKET_URL, 'with options:', SOCKET_OPTIONS);
    setIsConnecting(true);
    
    // Clean up previous socket if it exists
    if (socketRef.current) {
      if (DEBUG_MODE) console.log('Disconnecting existing socket...');
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    try {
      const socketInstance = io(SOCKET_URL, {
        ...SOCKET_OPTIONS,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 30000, // Increased timeout for better handling
      });
      
      socketRef.current = socketInstance;
      
      socketInstance.on('connect', () => {
        setConnected(true);
        setIsConnecting(false);
        setConnectionAttempts(0);
        setError(null);
        if (DEBUG_MODE) console.log('Connected to game server with ID:', socketInstance.id);
        toast.success('Connected to game server!');
      });
      
      socketInstance.on('disconnect', () => {
        setConnected(false);
        if (DEBUG_MODE) console.log('Disconnected from game server');
        toast.error('Disconnected from game server');
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
        console.error('Socket error event:', data.message);
        setError(data.message);
        toast.error(data.message);
      });
      
      setSocket(socketInstance);
    } catch (err) {
      console.error('Error creating socket connection:', err);
      setError(`Failed to create socket: ${err}`);
      setIsConnecting(false);
      toast.error('Failed to connect to game server');
    }
  }, [connectionAttempts]);
  
  useEffect(() => {
    connectToSocket();
    
    return () => {
      if (socketRef.current) {
        if (DEBUG_MODE) console.log('Cleaning up socket connection');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [connectToSocket]);

  // Add manual reconnect function
  const reconnect = useCallback(() => {
    setConnectionAttempts(0);
    setIsConnecting(true);
    setError(null);
    if (DEBUG_MODE) console.log('Manual reconnect initiated');
    
    connectToSocket();
  }, [connectToSocket]);

  return {
    socket,
    connected,
    isConnecting,
    error,
    reconnect
  };
};
