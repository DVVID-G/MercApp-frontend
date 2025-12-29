import { useSettings } from '../context/SettingsContext';
import { useMemo } from 'react';

const SYSTEM_CATEGORIES = [
  { value: 'Fruver', label: '🥬 Fruver' },
  { value: 'Lácteos', label: '🥛 Lácteos' },
  { value: 'Granos', label: '🌾 Granos' },
  { value: 'Carnes', label: '🥩 Carnes' },
  { value: 'Panadería', label: '🥖 Panadería' },
  { value: 'Bebidas', label: '🥤 Bebidas' },
  { value: 'Aseo', label: '🧼 Aseo' },
  { value: 'Higiene', label: '🧴 Higiene' },
  { value: 'Snacks', label: '🍿 Snacks' },
  { value: 'Condimentos', label: '🧂 Condimentos' },
  { value: 'Otros', label: '📦 Otros' },
];

export interface CategoryOption {
  value: string;
  label: string;
  isCustom?: boolean;
}

export function useCategories(): CategoryOption[] {
  const { customCategories } = useSettings();

  return useMemo(() => {
    const systemOptions: CategoryOption[] = SYSTEM_CATEGORIES.map(cat => ({
      value: cat.value,
      label: cat.label,
      isCustom: false,
    }));

    const customOptions: CategoryOption[] = customCategories.map(cat => ({
      value: cat.name,
      label: `⭐ ${cat.name}`,
      isCustom: true,
    }));

    // Combine: system categories first, then custom categories
    return [...systemOptions, ...customOptions];
  }, [customCategories]);
}

