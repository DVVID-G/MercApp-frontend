import { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { Card } from './Card';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export function GeneralSettings() {
  const { preferences, updatePreferences, loadingPreferences } = useSettings();
  const { theme: currentTheme, setTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'system'>('system');

  useEffect(() => {
    if (preferences) {
      setSelectedTheme(preferences.theme);
      // Sync with next-themes
      if (preferences.theme !== 'system') {
        setTheme(preferences.theme);
      }
    }
  }, [preferences, setTheme]);

  const handleThemeChange = async (theme: 'light' | 'dark' | 'system') => {
    setSelectedTheme(theme);
    
    // Update UI immediately
    if (theme !== 'system') {
      setTheme(theme);
    } else {
      // For system, detect OS preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }

    try {
      await updatePreferences({ theme });
      toast.success('Tema actualizado');
    } catch (error) {
      console.error('Failed to update theme', error);
      toast.error('Error al actualizar el tema');
      // Revert on error
      if (preferences) {
        setSelectedTheme(preferences.theme);
        if (preferences.theme !== 'system') {
          setTheme(preferences.theme);
        }
      }
    }
  };

  const themeOptions = [
    { value: 'light' as const, label: 'Claro', icon: Sun },
    { value: 'dark' as const, label: 'Oscuro', icon: Moon },
    { value: 'system' as const, label: 'Sistema', icon: Monitor },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <h4 className="text-sm font-medium text-white mb-4">Tema</h4>
        <div className="space-y-2">
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedTheme === option.value;
            return (
              <motion.button
                key={option.value}
                onClick={() => handleThemeChange(option.value)}
                className={`w-full flex items-center gap-3 p-3 rounded-[8px] border transition-colors ${
                  isSelected
                    ? 'bg-secondary-gold/10 border-secondary-gold/30 text-secondary-gold'
                    : 'bg-gray-900 border-gray-800 text-white hover:bg-gray-800'
                }`}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-5 h-5" />
                <span className="flex-1 text-left">{option.label}</span>
                {isSelected && (
                  <div className="w-2 h-2 rounded-full bg-secondary-gold" />
                )}
              </motion.button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

