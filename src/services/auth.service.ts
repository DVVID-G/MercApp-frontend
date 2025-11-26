import { api } from './api';

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user?: any;
};

export async function loginRequest(email: string, password: string): Promise<LoginResponse> {
  const res = await api.post('/auth/login', { email, password });
  return res.data as LoginResponse;
}

export async function refreshRequest(refreshToken: string) {
  const res = await api.post('/auth/refresh', { refreshToken });
  return res.data as { accessToken: string; refreshToken?: string };
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
  return res.data as LoginResponse | any;
}

export default { loginRequest, refreshRequest, logoutRequest, signupRequest };
