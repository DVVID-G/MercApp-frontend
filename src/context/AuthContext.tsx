import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, setAuthToken } from '../services/api';
import * as authService from '../services/auth.service';
import { Session, ActivityLog, getMeRequest } from '../services/auth.service';
import { User } from '../types/user';

type AuthState = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, confirmPassword?: string) => Promise<void>;
  logout: (sessionId?: string, all?: boolean) => Promise<void>;
  refreshUser: () => Promise<void>;
  sessions: Session[];
  activityLogs: ActivityLog[];
  loadingSessions: boolean;
  loadingActivityLogs: boolean;
  fetchSessions: () => Promise<void>;
  fetchActivityLogs: (params?: authService.GetActivityLogsParams) => Promise<{
    logs: ActivityLog[];
    total: number;
    limit: number;
    offset: number;
  } | null>;
  revokeSession: (sessionId: string) => Promise<void>;
  revokeAllSessions: () => Promise<void>;
};

const STORAGE_KEY = import.meta.env.VITE_AUTH_STORAGE_KEY || 'mercapp_auth';

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingActivityLogs, setLoadingActivityLogs] = useState(false);

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
        if (parsed?.user) setUser(parsed.user);
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

  // User data comes from login/signup response, no need to fetch separately

  const handleLogin = async (email: string, password: string) => {
    const data = await authService.loginRequest(email, password);
    const a = data.accessToken;
    const r = data.refreshToken;
    setAccessToken(a);
    setRefreshToken(r);
    setAuthToken(a);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ accessToken: a, refreshToken: r }));
    if (data.user) {
      setUser(data.user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ accessToken: a, refreshToken: r, user: data.user }));
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
      if (data.user) {
        setUser(data.user);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ accessToken: a, refreshToken: r, user: data.user }));
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ accessToken: a, refreshToken: r }));
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
          if (loginData.user) {
            setUser(loginData.user);
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ accessToken: la, refreshToken: lr, user: loginData.user }));
          } else {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ accessToken: la, refreshToken: lr }));
          }
        }
      } catch (e) {
        // login after signup failed; surface error to caller by rethrowing
        throw e;
      }
    }
  };

  const handleLogout = async (sessionId?: string, all?: boolean) => {
    try {
      await authService.logoutRequest(refreshToken || undefined, sessionId, all);
    } catch (e) {
      // ignore errors during logout
    }
    
    // If logging out current session or all sessions, clear local state
    if (!sessionId || all) {
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
      setAuthToken();
      localStorage.removeItem(STORAGE_KEY);
      setSessions([]);
      setActivityLogs([]);
    } else {
      // If revoking specific session, refresh sessions list
      await fetchSessions();
    }
  };

  const fetchSessions = useCallback(async () => {
    if (!accessToken) return;
    setLoadingSessions(true);
    try {
      const data = await authService.getSessions();
      setSessions(data.sessions);
    } catch (error) {
      console.error('Failed to fetch sessions', error);
    } finally {
      setLoadingSessions(false);
    }
  }, [accessToken]);

  const fetchActivityLogs = useCallback(async (params?: authService.GetActivityLogsParams): Promise<{
    logs: ActivityLog[];
    total: number;
    limit: number;
    offset: number;
  } | null> => {
    if (!accessToken) return null;
    setLoadingActivityLogs(true);
    try {
      const data = await authService.getActivityLogs(params);
      setActivityLogs(data.logs);
      return data;
    } catch (error) {
      console.error('Failed to fetch activity logs', error);
      return null;
    } finally {
      setLoadingActivityLogs(false);
    }
  }, [accessToken]);

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await authService.revokeSession(sessionId);
      await fetchSessions();
    } catch (error) {
      console.error('Failed to revoke session', error);
      throw error;
    }
  };

  const handleRevokeAllSessions = async () => {
    try {
      await authService.revokeAllSessions();
      // Clear local state since all sessions are revoked
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
      setAuthToken();
      localStorage.removeItem(STORAGE_KEY);
      setSessions([]);
      setActivityLogs([]);
    } catch (error) {
      console.error('Failed to revoke all sessions', error);
      throw error;
    }
  };

  const refreshUser = useCallback(async () => {
    try {
      const updatedUser = await getMeRequest();
      setUser(updatedUser);
      
      // Update STORAGE_KEY in localStorage
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          parsed.user = updatedUser;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        } catch (e) {
          // Handle parse errors - if parsing fails, create new entry with user
          const currentAccessToken = accessToken;
          const currentRefreshToken = refreshToken;
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
            accessToken: currentAccessToken, 
            refreshToken: currentRefreshToken, 
            user: updatedUser 
          }));
        }
      } else {
        // If no stored data, create new entry
        const currentAccessToken = accessToken;
        const currentRefreshToken = refreshToken;
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
          accessToken: currentAccessToken, 
          refreshToken: currentRefreshToken, 
          user: updatedUser 
        }));
      }
    } catch (error) {
      console.error('Failed to refresh user', error);
      throw error;
    }
  }, [accessToken, refreshToken]);

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        accessToken, 
        refreshToken, 
        login: handleLogin, 
        signup: handleSignup, 
        logout: handleLogout,
        refreshUser,
        sessions,
        activityLogs,
        loadingSessions,
        loadingActivityLogs,
        fetchSessions,
        fetchActivityLogs,
        revokeSession: handleRevokeSession,
        revokeAllSessions: handleRevokeAllSessions
      }}
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
