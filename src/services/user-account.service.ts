import { api } from './api';
import { User } from '../types/user';

export interface UpdateAccountInput {
  name?: string;
  email?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

/**
 * Updates the authenticated user's account information.
 * 
 * @param updates - The account fields to update (name and/or email)
 * @returns Promise resolving to the updated User object
 */
export async function updateAccount(updates: UpdateAccountInput): Promise<User> {
  const res = await api.put('/auth/me', updates);
  return res.data;
}

/**
 * Changes the authenticated user's password.
 * 
 * @param input - The current and new password values
 * @returns Promise resolving to an object with a success message
 */
export async function changePassword(input: ChangePasswordInput): Promise<{ message: string }> {
  const res = await api.put('/auth/password', input);
  return res.data;
}

