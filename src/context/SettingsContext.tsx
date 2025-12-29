import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as userPreferencesService from '../services/user-preferences.service';
import * as customCategoryService from '../services/custom-category.service';
import { CustomCategory } from '../services/custom-category.service';
import { UserPreferences } from '../services/user-preferences.service';
import { useAuth } from './AuthContext';

interface SettingsContextType {
  preferences: UserPreferences | null;
  customCategories: CustomCategory[];
  loadingPreferences: boolean;
  loadingCategories: boolean;
  fetchPreferences: () => Promise<void>;
  updatePreferences: (updates: userPreferencesService.UpdatePreferencesInput) => Promise<void>;
  fetchCategories: () => Promise<void>;
  createCategory: (name: string) => Promise<void>;
  updateCategory: (id: string, updates: customCategoryService.UpdateCategoryInput) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { accessToken } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [loadingPreferences, setLoadingPreferences] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const fetchPreferences = useCallback(async () => {
    if (!accessToken) return;
    setLoadingPreferences(true);
    try {
      const data = await userPreferencesService.getPreferences();
      setPreferences(data);
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
    } catch (error) {
      console.error('Failed to update preferences', error);
      throw error;
    }
  }, [accessToken]);

  const fetchCategories = useCallback(async () => {
    if (!accessToken) return;
    setLoadingCategories(true);
    try {
      const data = await customCategoryService.getCategories();
      setCustomCategories(data.categories);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    } finally {
      setLoadingCategories(false);
    }
  }, [accessToken]);

  const createCategory = useCallback(async (name: string) => {
    if (!accessToken) return;
    try {
      await customCategoryService.createCategory({ name });
      await fetchCategories();
    } catch (error) {
      console.error('Failed to create category', error);
      throw error;
    }
  }, [accessToken, fetchCategories]);

  const updateCategory = useCallback(async (id: string, updates: customCategoryService.UpdateCategoryInput) => {
    if (!accessToken) return;
    try {
      await customCategoryService.updateCategory(id, updates);
      await fetchCategories();
    } catch (error) {
      console.error('Failed to update category', error);
      throw error;
    }
  }, [accessToken, fetchCategories]);

  const deleteCategory = useCallback(async (id: string) => {
    if (!accessToken) return;
    try {
      await customCategoryService.deleteCategory(id);
      await fetchCategories();
    } catch (error) {
      console.error('Failed to delete category', error);
      throw error;
    }
  }, [accessToken, fetchCategories]);

  useEffect(() => {
    if (accessToken) {
      fetchPreferences();
      fetchCategories();
    }
  }, [accessToken, fetchPreferences, fetchCategories]);

  return (
    <SettingsContext.Provider
      value={{
        preferences,
        customCategories,
        loadingPreferences,
        loadingCategories,
        fetchPreferences,
        updatePreferences,
        fetchCategories,
        createCategory,
        updateCategory,
        deleteCategory,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

