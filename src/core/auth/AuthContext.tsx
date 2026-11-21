import React, { createContext, useContext, useState, useEffect } from 'react';
import { SecureStorageService, authUserStorageKey } from '../storage/SecureStorageService';
import { AuthRepository, AuthResponse } from '../repositories/AuthRepository';
import { apiSessionExpiredEvent } from '../network/apiClient';
import { logger } from '../services/logger';
export { UserRole, normalizeRole } from './UserRole';
import { UserRole, normalizeRole } from './UserRole';

interface User {
  id: string;
  role: UserRole;
  name: string;
  phoneNumber?: string;
  familyId?: string;
  childProfileId?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAuthReady: boolean;
}

interface AuthContextType extends AuthState {
  handleAuthResponse: (response: AuthResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isAuthReady: false,
  });

  useEffect(() => {
    const initAuth = async () => {
      const token = SecureStorageService.getAccessToken();
      const savedUser = SecureStorageService.getUser();

      if (token && savedUser) {
        setState({
          user: { ...savedUser, role: normalizeRole(savedUser.role) },
          isAuthenticated: true,
          isAuthReady: true,
        });
        
        // Optionally verify token with /auth/me
        try {
          // const user = await AuthRepository.getMe();
          // setState(s => ({ ...s, user }));
        } catch (e) {
          // logout();
        }
      } else {
        setState(s => ({ ...s, isAuthReady: true }));
      }
    };

    initAuth();

    const syncSession = (event: StorageEvent) => {
      if (event.key !== authUserStorageKey && event.key !== null) return;
      const savedUser = SecureStorageService.getUser();
      const isAuthenticated = !!(savedUser && SecureStorageService.getAccessToken());
      setState({
        user: isAuthenticated ? { ...savedUser, role: normalizeRole(savedUser.role) } : null,
        isAuthenticated,
        isAuthReady: true,
      });
    };
    window.addEventListener('storage', syncSession);

    // apiClient raises this when the server rejects the refresh token. Storage is already cleared there;
    // dropping auth state lets ProtectedRoute route to /login without a full page reload.
    const expireSession = () => setState({ user: null, isAuthenticated: false, isAuthReady: true });
    window.addEventListener(apiSessionExpiredEvent, expireSession);

    return () => {
      window.removeEventListener('storage', syncSession);
      window.removeEventListener(apiSessionExpiredEvent, expireSession);
    };
  }, []);

  const handleAuthResponse = (response: AuthResponse) => {
    // Normalize on the way in: an API role string the app does not map would otherwise leave an
    // authenticated user that RoleRedirect sends to /login.
    const user = { ...response.user, role: normalizeRole(response.user.role) };
    SecureStorageService.saveAccessToken(response.accessToken);
    SecureStorageService.saveRefreshToken(response.refreshToken);
    SecureStorageService.saveUser(user);

    setState({
      user,
      isAuthenticated: true,
      isAuthReady: true,
    });
  };

  const logout = async () => {
    const refreshToken = SecureStorageService.getRefreshToken();
    const accessToken = SecureStorageService.getAccessToken();
    SecureStorageService.clearAll();
    setState({
      user: null,
      isAuthenticated: false,
      isAuthReady: true,
    });

    if (refreshToken) {
      try {
        await AuthRepository.logout(refreshToken, accessToken ?? undefined);
      } catch (e) {
        logger.error('Logout error', e);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, handleAuthResponse, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
