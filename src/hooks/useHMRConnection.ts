import { useState, useEffect } from 'react';

export function useHMRConnection() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    if (import.meta.hot) {
      const onDisconnect = () => setIsConnected(false);
      const onConnect = () => setIsConnected(true);

      import.meta.hot.on('vite:disconnect', onDisconnect);
      import.meta.hot.on('vite:connect', onConnect);

      return () => {
        import.meta.hot?.off('vite:disconnect', onDisconnect);
        import.meta.hot?.off('vite:connect', onConnect);
      };
    }
  }, []);

  return isConnected;
} 