
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
  const isInitialMount = useRef(true);
  
  const connectToSocket = useCallback(() => {
    if (DEBUG_MODE) {
      console.log('Connecting to game server at:', SOCKET_URL);
      console.log('With socket options:', SOCKET_OPTIONS);
    }
    
    setIsConnecting(true);
    
    // Clean up previous socket if it exists
    if (socketRef.current && !socketRef.current.connected) {
      if (DEBUG_MODE) console.log('Disconnecting existing socket...');
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    // Don't create a new socket if we already have a connected one
    if (socketRef.current && socketRef.current.connected) {
      if (DEBUG_MODE) console.log('Using existing connected socket');
      setConnected(true);
      setIsConnecting(false);
      setSocket(socketRef.current);
      return;
    }
    
    try {
      const socketInstance = io(SOCKET_URL, {
        ...SOCKET_OPTIONS,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        timeout: 60000,
      });
      
      socketRef.current = socketInstance;
      
      // Log all socket events for debugging
      if (DEBUG_MODE) {
        socketInstance.onAny((event, ...args) => {
          console.log(`[Socket Event] ${event}:`, args);
        });
      }
      
      socketInstance.on('connect', () => {
        setConnected(true);
        setIsConnecting(false);
        setConnectionAttempts(0);
        setError(null);
        if (DEBUG_MODE) console.log('Connected to game server with ID:', socketInstance.id);
        toast.success('Connected to game server!');
      });
      
      socketInstance.on('disconnect', (reason) => {
        setConnected(false);
        if (DEBUG_MODE) console.log('Disconnected from game server. Reason:', reason);
        // Only show toast if it's an unexpected disconnect
        if (reason !== 'io client disconnect') {
          toast.error(`Disconnected from game server: ${reason}`);
        }
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
    // Only connect on initial mount
    if (isInitialMount.current) {
      connectToSocket();
      isInitialMount.current = false;
    }
    
    // Don't disconnect on component unmount - this allows the socket to persist
    // between route changes
    return () => {
      // We're no longer cleaning up the socket on component unmount
      // This is important to prevent the auto-disconnect issue
    };
  }, [connectToSocket]);

  // Add manual reconnect function
  const reconnect = useCallback(() => {
    setConnectionAttempts(0);
    setIsConnecting(true);
    setError(null);
    if (DEBUG_MODE) console.log('Manual reconnect initiated');
    
    // Force disconnect before reconnecting
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    connectToSocket();
  }, [connectToSocket]);

  // Add a manual disconnect function for when we actually want to disconnect
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      if (DEBUG_MODE) console.log('Manual disconnect initiated');
      socketRef.current.disconnect();
      setConnected(false);
    }
  }, []);

  return {
    socket,
    connected,
    isConnecting,
    error,
    reconnect,
    disconnect
  };
};
