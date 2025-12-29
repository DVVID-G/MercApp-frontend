import { api } from './api';
import { User } from '../types/user';

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user?: User;
};

export async function loginRequest(email: string, password: string): Promise<LoginResponse> {
  const res = await api.post('/auth/login', { email, password });
  // Backend response: { accessToken, refreshToken, name, email }
  const data = res.data;
  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    user: data.name && data.email ? { name: String(data.name), email: String(data.email) } : undefined
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

type LogoutRequestBody = {
  all?: true;
  sessionId?: string;
  refreshToken?: string;
};

type LogoutResponse = {
  message: string;
  revokedCount?: number;
};

/**
 * Logs out the user by revoking sessions or refresh tokens.
 * 
 * @param refreshToken - Optional refresh token to revoke (legacy support)
 * @param sessionId - Optional specific session ID to revoke
 * @param all - If true, revokes all sessions for the authenticated user
 * @returns Promise resolving to the logout response with a message and optionally revokedCount
 * 
 * @example
 * // Logout current session
 * await logoutRequest();
 * 
 * @example
 * // Logout specific session
 * await logoutRequest(undefined, 'session-id-123');
 * 
 * @example
 * // Logout all sessions
 * await logoutRequest(undefined, undefined, true);
 */
export async function logoutRequest(
  refreshToken?: string,
  sessionId?: string,
  all?: boolean
): Promise<LogoutResponse> {
  const body: LogoutRequestBody = {};
  if (all) {
    body.all = true;
  } else if (sessionId) {
    body.sessionId = sessionId;
  } else if (refreshToken) {
    body.refreshToken = refreshToken;
  }
  const res = await api.post<LogoutResponse>('/auth/logout', body);
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

/**
 * Retrieves all active sessions for the authenticated user.
 * 
 * @returns Promise resolving to an object containing an array of Session objects
 */
export async function getSessions(): Promise<{ sessions: Session[] }> {
  const res = await api.get('/auth/sessions');
  return res.data;
}

/**
 * Revokes a specific session by its ID.
 * 
 * @param sessionId - The unique identifier of the session to revoke
 * @returns Promise that resolves when the session is successfully revoked
 */
export async function revokeSession(sessionId: string): Promise<void> {
  await api.delete(`/auth/sessions/${sessionId}`);
}

/**
 * Revokes all active sessions for the authenticated user.
 * 
 * @returns Promise resolving to an object containing the count of revoked sessions
 */
export async function revokeAllSessions(): Promise<{ revokedCount: number }> {
  const res = await api.delete('/auth/sessions');
  return res.data;
}

/**
 * Parameters for filtering and paginating activity logs.
 * 
 * @property eventType - Optional filter by event type (login, logout, session_revoked, login_failed)
 * @property limit - Optional maximum number of logs to return
 * @property offset - Optional number of logs to skip for pagination
 * @property startDate - Optional ISO date string to filter logs from this date onwards
 * @property endDate - Optional ISO date string to filter logs up to this date
 */
export interface GetActivityLogsParams {
  eventType?: 'login' | 'logout' | 'session_revoked' | 'login_failed';
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
}

/**
 * Retrieves activity logs for the authenticated user with optional filtering and pagination.
 * 
 * @param params - Optional parameters to filter and paginate the activity logs
 * @returns Promise resolving to an object containing the logs array, total count, limit, and offset
 */
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

export async function signupRequest(payload: SignupPayload): Promise<{
  accessToken?: string;
  refreshToken?: string;
  user?: User;
}> {
  // Send the full payload expected by the backend
  const res = await api.post('/auth/signup', payload);
  // Transform backend response: { token, refreshToken, name, email } -> { accessToken, refreshToken, user }
  const data = res.data;
  return {
    accessToken: data.token,
    refreshToken: data.refreshToken,
    user: data.name && data.email ? { name: String(data.name), email: String(data.email) } : undefined
  };
}

export async function getMeRequest(): Promise<User> {
  const res = await api.get('/auth/me');
  return res.data;
}

export default { loginRequest, refreshRequest, logoutRequest, signupRequest, getMeRequest };
