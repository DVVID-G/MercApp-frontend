import { useEffect } from 'react';
import { Card } from './Card';
import { useSettings } from '../context/SettingsContext';
import { ThemeSelector } from './ThemeSelector';
import { motion } from 'motion/react';

export function GeneralSettings() {
  const { preferences, loadingPreferences } = useSettings();

  if (loadingPreferences) {
    return (
      <Card className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-800 rounded w-32"></div>
          <div className="h-12 bg-gray-800 rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <Card className="p-4">
        <h3 className="mb-4">Apariencia</h3>
        <ThemeSelector />
      </Card>
    </motion.div>
  );
}

