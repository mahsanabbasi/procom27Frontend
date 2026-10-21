import { createContext, useContext, useState, useEffect } from 'react';
import { api, getToken, setToken, removeToken } from '../api/client';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(getToken());
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const curToken = getToken();
    if (!curToken) {
      setUser(null);
      setLoading(false);
      return;
    }
    const res = await api.getProfile();
    if (res.success && res.data) {
      setUser(res.data);
    } else {
      setUser(null);
      removeToken();
      setTokenState(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.success && res.data) {
      const accessToken = res.data.accessToken;
      setToken(accessToken);
      setTokenState(accessToken);
      setUser(res.data.user);
      return { success: true, message: res.message };
    }
    return { success: false, message: res.message || 'Login failed' };
  };

  const register = async (payload) => {
    const res = await api.register(payload);
    if (res.success && res.data) {
      const accessToken = res.data.accessToken;
      setToken(accessToken);
      setTokenState(accessToken);
      setUser(res.data.user);
      return { success: true, message: res.message };
    }
    return { success: false, message: res.message || 'Registration failed', errors: res.errors };
  };

  const logout = () => {
    removeToken();
    setTokenState(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
