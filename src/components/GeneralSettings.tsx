import { useEffect, useState } from 'react';
import { Card } from './Card';
import { useSettings } from '../context/SettingsContext';
import { ThemeSelector } from './ThemeSelector';
import { motion } from 'motion/react';

export function GeneralSettings() {
  const { preferences, loadingPreferences } = useSettings();
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check for prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  if (loadingPreferences) {
    return (
      <Card className="p-4 sm:p-6">
        <div 
          className="animate-pulse space-y-4"
          role="status"
          aria-live="polite"
          aria-label="Cargando preferencias"
        >
          <div className="h-6 bg-gray-800 rounded w-32" aria-hidden="true"></div>
          <div className="h-12 bg-gray-800 rounded" aria-hidden="true"></div>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reducedMotion ? {} : { duration: 0.3 }}
      className="space-y-4 sm:space-y-6"
      role="region"
      aria-labelledby="appearance-heading"
    >
      <Card className="p-4 sm:p-6">
        <h3 id="appearance-heading" className="mb-4 sm:mb-6">
          Apariencia
        </h3>
        <ThemeSelector />
      </Card>
    </motion.div>
  );
}

