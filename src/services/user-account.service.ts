import { api } from './api';

export interface UpdateAccountInput {
  name?: string;
  email?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export async function updateAccount(updates: UpdateAccountInput): Promise<User> {
  const res = await api.put('/auth/me', updates);
  return res.data;
}

export async function changePassword(input: ChangePasswordInput): Promise<{ message: string }> {
  const res = await api.put('/auth/password', input);
  return res.data;
}

