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

export async function logoutRequest(refreshToken: string) {
  const res = await api.post('/auth/logout', { refreshToken });
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

export default { loginRequest, refreshRequest, logoutRequest, signupRequest };
