import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check initial status
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Back online! Changes will sync now.');
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('You are offline. Changes will sync when reconnected.', {
        duration: Infinity,
        id: 'offline-status',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      toast.dismiss('offline-status');
    };
  }, []);

  return isOnline;
}
