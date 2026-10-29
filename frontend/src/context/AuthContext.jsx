import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setAuthToken, getAuthToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getAuthToken());
  const [loading, setLoading] = useState(true);

  // Restore session
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = getAuthToken();
      if (savedToken) {
        try {
          const res = await api.getMe();
          setUser(res.user);
        } catch (err) {
          console.warn('Session expired or invalid:', err.message);
          setAuthToken(null);
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    setUser(res.user);
    setToken(res.token);
    setAuthToken(res.token);
    return res;
  };

  const register = async (fullName, email, password, confirmPassword) => {
    const res = await api.register({ fullName, email, password, confirmPassword });
    // User account is only opened and authenticated after verifying the email OTP
    return res;
  };

  const verifyEmail = async (email, code) => {
    const res = await api.verifyEmail({ email, code });
    setUser(res.user);
    setToken(res.token);
    setAuthToken(res.token);
    return res;
  };

  const sendLoginOtp = async (email) => {
    return await api.sendLoginOtp(email);
  };

  const loginWithOtp = async (email, code) => {
    const res = await api.verifyLoginOtp(email, code);
    setUser(res.user);
    setToken(res.token);
    setAuthToken(res.token);
    return res;
  };

  const logout = () => {
    setAuthToken(null);
    setToken(null);
    setUser(null);
  };

  // Quick switch for demo testing
  const switchDemoAccount = async (accountType) => {
    if (accountType === 'admin') {
      return await login('teslasupporttech@gmail.com', 'Tesla@admin');
    } else {
      return await login('john.doe@example.com', 'Password123!');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        sendLoginOtp,
        loginWithOtp,
        register,
        verifyEmail,
        logout,
        switchDemoAccount,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
