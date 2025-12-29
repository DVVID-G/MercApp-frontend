import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as userPreferencesService from '../services/user-preferences.service';
import * as userAccountService from '../services/user-account.service';
import { useAuth } from './AuthContext';
import { getMeRequest } from '../services/auth.service';
import { toast } from 'sonner';

const STORAGE_KEY = import.meta.env.VITE_AUTH_STORAGE_KEY || 'mercapp_auth';

type SettingsState = {
  preferences: userPreferencesService.UserPreferences | null;
  loadingPreferences: boolean;
  fetchPreferences: () => Promise<void>;
  updatePreferences: (updates: userPreferencesService.UpdatePreferencesInput) => Promise<void>;
  updateAccount: (updates: userAccountService.UpdateAccountInput) => Promise<void>;
  changePassword: (input: userAccountService.ChangePasswordInput) => Promise<void>;
  updatingAccount: boolean;
  changingPassword: boolean;
};

const SettingsContext = createContext<SettingsState | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { accessToken } = useAuth();
  const [preferences, setPreferences] = useState<userPreferencesService.UserPreferences | null>(null);
  const [loadingPreferences, setLoadingPreferences] = useState(false);
  const [updatingAccount, setUpdatingAccount] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const fetchPreferences = useCallback(async () => {
    if (!accessToken) return;
    
    setLoadingPreferences(true);
    try {
      const prefs = await userPreferencesService.getPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Failed to fetch preferences', error);
    } finally {
      setLoadingPreferences(false);
    }
  }, [accessToken]);

  const updatePreferences = useCallback(async (updates: userPreferencesService.UpdatePreferencesInput) => {
    if (!accessToken) return;
    
    try {
      const updated = await userPreferencesService.updatePreferences(updates);
      setPreferences(updated);
    } catch (error: any) {
      console.error('Failed to update preferences', error);
      toast.error('Error al actualizar preferencias');
      throw error;
    }
  }, [accessToken]);

  const updateAccount = useCallback(async (updates: userAccountService.UpdateAccountInput) => {
    if (!accessToken) return;
    
    setUpdatingAccount(true);
    try {
      await userAccountService.updateAccount(updates);
      // Refresh user data and update localStorage
      const updatedUser = await getMeRequest();
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          parsed.user = updatedUser;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        } catch (e) {
          // ignore
        }
      }
      toast.success('Información de cuenta actualizada');
      // Reload page to refresh user data in AuthContext
      window.location.reload();
    } catch (error: any) {
      console.error('Failed to update account', error);
      const message = error.response?.data?.message || 'Error al actualizar cuenta';
      toast.error(message);
      throw error;
    } finally {
      setUpdatingAccount(false);
    }
  }, [accessToken]);

  const changePassword = useCallback(async (input: userAccountService.ChangePasswordInput) => {
    if (!accessToken) return;
    
    setChangingPassword(true);
    try {
      await userAccountService.changePassword(input);
      toast.success('Contraseña actualizada exitosamente');
    } catch (error: any) {
      console.error('Failed to change password', error);
      const message = error.response?.data?.message || 'Error al cambiar contraseña';
      toast.error(message);
      throw error;
    } finally {
      setChangingPassword(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (accessToken) {
      fetchPreferences();
    }
  }, [accessToken, fetchPreferences]);

  return (
    <SettingsContext.Provider
      value={{
        preferences,
        loadingPreferences,
        fetchPreferences,
        updatePreferences,
        updateAccount,
        changePassword,
        updatingAccount,
        changingPassword,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

