import { api } from './api';

export interface UserPreferences {
  _id: string;
  userId: string;
  theme: 'light' | 'dark' | 'system';
  language?: string;
  currencyDisplay?: 'COP' | 'USD';
  dateFormat?: string;
  notifications?: {
    email?: boolean;
    push?: boolean;
    purchaseReminders?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePreferencesInput {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  currencyDisplay?: 'COP' | 'USD';
  dateFormat?: string;
  notifications?: {
    email?: boolean;
    push?: boolean;
    purchaseReminders?: boolean;
  };
}

export async function getPreferences(): Promise<UserPreferences> {
  const res = await api.get('/auth/preferences');
  return res.data;
}

export async function updatePreferences(updates: UpdatePreferencesInput): Promise<UserPreferences> {
  const res = await api.put('/auth/preferences', updates);
  return res.data;
}

