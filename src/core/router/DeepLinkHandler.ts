import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

/**
 * Hook to handle deep link navigation from notifications
 */
export const useDeepLinkHandler = () => {
  const navigate = useNavigate();

  const handleDeepLink = useCallback((path: string) => {
    // Basic validation and mapping if needed
    if (!path) return;

    // Example mapping (if paths from backend differ from frontend routes)
    // For now, we assume paths match our AppRouter routes
    
    navigate(path);
  }, [navigate]);

  return { handleDeepLink };
};
