import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

/**
 * Hook to handle deep link navigation from notifications
 */
export const useDeepLinkHandler = () => {
  const navigate = useNavigate();

  const handleDeepLink = useCallback((path: string) => {
    if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) return;
    navigate(path);
  }, [navigate]);

  return { handleDeepLink };
};
