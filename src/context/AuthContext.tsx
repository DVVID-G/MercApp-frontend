import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, setAuthToken } from '../services/api';
import * as authService from '../services/auth.service';

type AuthState = {
  user: any | null;
  accessToken: string | null;
  refreshToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, confirmPassword?: string) => Promise<void>;
  logout: () => Promise<void>;
};

const STORAGE_KEY = import.meta.env.VITE_AUTH_STORAGE_KEY || 'mercapp_auth';

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed?.accessToken) {
          setAccessToken(parsed.accessToken);
          setAuthToken(parsed.accessToken);
        }
        if (parsed?.refreshToken) setRefreshToken(parsed.refreshToken);
      } catch (e) {
        // ignore
      }
    }

    const interceptor = api.interceptors.response.use(
      (res) => res,
      async (error) => {
        const originalRequest = error.config;
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            if (refreshToken) {
              const data = await authService.refreshRequest(refreshToken);
              const newAccess = data.accessToken;
              const newRefresh = data.refreshToken || refreshToken;
              setAccessToken(newAccess);
              setRefreshToken(newRefresh);
              setAuthToken(newAccess);
              localStorage.setItem(STORAGE_KEY, JSON.stringify({ accessToken: newAccess, refreshToken: newRefresh }));
              originalRequest.headers['Authorization'] = `Bearer ${newAccess}`;
              return api(originalRequest);
            }
          } catch (e) {
            // refresh failed
            await handleLogout();
            return Promise.reject(e);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshToken]);

  useEffect(() => {
    // Try to fetch current user if we have a token
    if (accessToken) {
      (async () => {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
        } catch (e) {
          // ignore
        }
      })();
    }
  }, [accessToken]);

  const handleLogin = async (email: string, password: string) => {
    const data = await authService.loginRequest(email, password);
    const a = data.accessToken;
    const r = data.refreshToken;
    setAccessToken(a);
    setRefreshToken(r);
    setAuthToken(a);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ accessToken: a, refreshToken: r }));
    if (data.user) setUser(data.user);
    else {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data);
      } catch (e) {
        // ignore
      }
    }
  };

  const handleSignup = async (name: string, email: string, password: string, confirmPassword?: string) => {
    // Call signup endpoint with full payload; if it returns tokens, treat as logged in
    const data = await authService.signupRequest({ name, email, password, confirmPassword });
    const a = data?.accessToken;
    const r = data?.refreshToken;
    if (a) {
      setAccessToken(a);
      setRefreshToken(r || null);
      setAuthToken(a);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ accessToken: a, refreshToken: r }));
      if (data.user) setUser(data.user);
      else {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
        } catch (e) {
          // ignore
        }
      }
    } else {
      // If signup did not return tokens, attempt to login with provided credentials
      try {
        const loginData = await authService.loginRequest(email, password);
        const la = loginData.accessToken;
        const lr = loginData.refreshToken;
        if (la) {
          setAccessToken(la);
          setRefreshToken(lr || null);
          setAuthToken(la);
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ accessToken: la, refreshToken: lr }));
          if (loginData.user) setUser(loginData.user);
          else {
            try {
              const res = await api.get('/auth/me');
              setUser(res.data);
            } catch (e) {
              // ignore
            }
          }
        }
      } catch (e) {
        // login after signup failed; surface error to caller by rethrowing
        throw e;
      }
    }
  };

  const handleLogout = async () => {
    try {
      if (refreshToken) await authService.logoutRequest(refreshToken);
    } catch (e) {
      // ignore
    }
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    setAuthToken();
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{ user, accessToken, refreshToken, login: handleLogin, signup: handleSignup, logout: handleLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
