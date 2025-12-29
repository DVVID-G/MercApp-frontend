import { api } from './api';

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user?: any;
};

export async function loginRequest(email: string, password: string): Promise<LoginResponse> {
  const res = await api.post('/auth/login', { email, password });
  // Backend response: { accessToken, refreshToken, name, email }
  const data = res.data;
  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    user: data.name || data.email ? { name: data.name, email: data.email } : undefined
  };
}

export async function refreshRequest(refreshToken: string) {
  const res = await api.post('/auth/refresh', { refreshToken });
  // Backend response: { accessToken, refreshToken }
  const data = res.data;
  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken
  };
}

export async function logoutRequest(refreshToken?: string, sessionId?: string, all?: boolean) {
  const body: any = {};
  if (all) {
    body.all = true;
  } else if (sessionId) {
    body.sessionId = sessionId;
  } else if (refreshToken) {
    body.refreshToken = refreshToken;
  }
  const res = await api.post('/auth/logout', body);
  return res.data;
}

export interface Session {
  id: string;
  deviceInfo: {
    userAgent: string;
    deviceType: 'mobile' | 'desktop' | 'tablet';
    platform: string;
    browser: string;
  };
  ipAddress: string;
  status: 'active' | 'revoked' | 'expired';
  createdAt: string;
  lastActivityAt: string;
  expiresAt: string;
  isCurrent?: boolean;
}

export interface ActivityLog {
  id: string;
  eventType: 'login' | 'logout' | 'session_revoked' | 'login_failed';
  sessionId?: string;
  deviceInfo: {
    userAgent: string;
    deviceType: 'mobile' | 'desktop' | 'tablet';
    platform: string;
    browser: string;
  };
  ipAddress: string;
  success: boolean;
  reason?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export async function getSessions(): Promise<{ sessions: Session[] }> {
  const res = await api.get('/auth/sessions');
  return res.data;
}

export async function revokeSession(sessionId: string): Promise<void> {
  await api.delete(`/auth/sessions/${sessionId}`);
}

export async function revokeAllSessions(): Promise<{ revokedCount: number }> {
  const res = await api.delete('/auth/sessions');
  return res.data;
}

export interface GetActivityLogsParams {
  eventType?: 'login' | 'logout' | 'session_revoked' | 'login_failed';
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
}

export async function getActivityLogs(params?: GetActivityLogsParams): Promise<{
  logs: ActivityLog[];
  total: number;
  limit: number;
  offset: number;
}> {
  const res = await api.get('/auth/activity-logs', { params });
  return res.data;
}

export type SignupPayload = {
  name?: string;
  email: string;
  password: string;
  confirmPassword?: string;
};

export async function signupRequest(payload: SignupPayload) {
  // Send the full payload expected by the backend
  const res = await api.post('/auth/signup', payload);
  // Transform backend response: { token, refreshToken, name, email } -> { accessToken, refreshToken, user }
  const data = res.data;
  return {
    accessToken: data.token,
    refreshToken: data.refreshToken,
    user: data.name || data.email ? { name: data.name, email: data.email } : undefined
  };
}

export async function getMeRequest() {
  const res = await api.get('/auth/me');
  return res.data;
}

export default { loginRequest, refreshRequest, logoutRequest, signupRequest, getMeRequest };
