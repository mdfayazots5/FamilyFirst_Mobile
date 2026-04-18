const ACCESS_TOKEN_KEY = 'ff_access_token';
const REFRESH_TOKEN_KEY = 'ff_refresh_token';
const USER_KEY = 'ff_user';

export const SecureStorageService = {
  saveAccessToken: (token: string) => localStorage.setItem(ACCESS_TOKEN_KEY, token),
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  deleteAccessToken: () => localStorage.removeItem(ACCESS_TOKEN_KEY),

  saveRefreshToken: (token: string) => localStorage.setItem(REFRESH_TOKEN_KEY, token),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  deleteRefreshToken: () => localStorage.removeItem(REFRESH_TOKEN_KEY),

  saveUser: (user: any) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  getUser: () => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },
  deleteUser: () => localStorage.removeItem(USER_KEY),

  clearAll: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};
