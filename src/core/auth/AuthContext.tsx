import React, { createContext, useContext, useState, useEffect } from 'react';
import { SecureStorageService } from '../storage/SecureStorageService';
import { AuthRepository, AuthResponse } from '../repositories/AuthRepository';

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  FAMILY_ADMIN = 'FAMILY_ADMIN',
  PARENT = 'PARENT',
  TEACHER = 'TEACHER',
  CHILD = 'CHILD',
  ELDER = 'ELDER',
}

interface User {
  id: string;
  role: UserRole;
  name: string;
  familyId?: string;
  childProfileId?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAuthReady: boolean;
}

interface AuthContextType extends AuthState {
  loginAsRole: (role: UserRole) => void;
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
          user: savedUser,
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
  }, []);

  const handleAuthResponse = (response: AuthResponse) => {
    SecureStorageService.saveAccessToken(response.accessToken);
    SecureStorageService.saveRefreshToken(response.refreshToken);
    SecureStorageService.saveUser(response.user);
    
    setState({
      user: response.user,
      isAuthenticated: true,
      isAuthReady: true,
    });
  };

  const loginAsRole = (role: UserRole) => {
    // This is still used for the quick demo login screen
    const mockUser: User = {
      id: `mock_${role.toLowerCase()}`,
      role,
      name: `Demo ${role.charAt(0) + role.slice(1).toLowerCase().replace('_', ' ')}`,
      familyId: 'fam_123',
    };
    
    handleAuthResponse({
      accessToken: 'demo_token',
      refreshToken: 'demo_refresh',
      user: mockUser
    });
  };

  const logout = async () => {
    const refreshToken = SecureStorageService.getRefreshToken();
    if (refreshToken) {
      try {
        await AuthRepository.logout(refreshToken);
      } catch (e) {
        console.error('Logout error', e);
      }
    }
    
    SecureStorageService.clearAll();
    setState({
      user: null,
      isAuthenticated: false,
      isAuthReady: true,
    });
  };

  return (
    <AuthContext.Provider value={{ ...state, loginAsRole, handleAuthResponse, logout }}>
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
