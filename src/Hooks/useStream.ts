import { useEffect, useRef, useState, useCallback } from 'react';
import io from 'socket.io-client';

const useStream = (url: string) => {

  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // 'transports' ensures we use WebSocket first, avoiding polling issues
    const socketIo = io(url, {
      transports: ['websocket'], 
      reconnectionAttempts: 5,
    });

    socketRef.current = socketIo;

    socketIo.on('connect', () => {
      console.log('Socket Connected:', socketIo.id);
      setIsConnected(true);
    });

    socketIo.on('disconnect', () => {
      console.log('Socket Disconnected');
      setIsConnected(false);
    });

    socketIo.on('connect_error', (err) => {
      console.error('Socket Connection Error:', err);
    });

    return () => {
      socketIo.disconnect();
    };
  }, [url]);

  const emit = useCallback((eventName, data) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit(eventName, data);
    } else {
      console.warn(`Cannot emit "${eventName}": Socket not connected.`);
    }
  }, []);

  /**
   * Wrapper to listen to events
   * Returns a cleanup function to remove the listener automatically
   */
  const on = useCallback((eventName, callback) => {
    if (socketRef.current) {
      socketRef.current.on(eventName, callback);
      
      // Return a cleanup function for useEffects in components
      return () => {
        if(socketRef.current) socketRef.current.off(eventName, callback);
      };
    }
  }, []);

  return { socket: socketRef.current, isConnected, emit, on };
};

export default useStream;