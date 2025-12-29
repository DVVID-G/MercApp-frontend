import { useEffect, useState } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from 'next-themes';
import { Button } from './Button';

export function ThemeSelector() {
  const { preferences, updatePreferences } = useSettings();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && preferences?.theme) {
      setTheme(preferences.theme);
    }
  }, [mounted, preferences?.theme, setTheme]);

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    try {
      await updatePreferences({ theme: newTheme });
    } catch (error) {
      // Revert on error
      if (preferences?.theme) {
        setTheme(preferences.theme);
      }
    }
  };

  if (!mounted) {
    return (
      <div className="flex gap-2">
        <div className="flex-1 h-12 bg-gray-800 rounded animate-pulse"></div>
        <div className="flex-1 h-12 bg-gray-800 rounded animate-pulse"></div>
        <div className="flex-1 h-12 bg-gray-800 rounded animate-pulse"></div>
      </div>
    );
  }

  const currentTheme = preferences?.theme || 'system';

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-gray-400 mb-2">Tema</p>
      <div className="grid grid-cols-3 gap-2">
        <Button
          variant={currentTheme === 'light' ? 'primary' : 'ghost'}
          onClick={() => handleThemeChange('light')}
          className="flex flex-col items-center gap-2 py-4"
        >
          <Sun className="w-5 h-5" />
          <span className="text-sm">Claro</span>
        </Button>
        <Button
          variant={currentTheme === 'dark' ? 'primary' : 'ghost'}
          onClick={() => handleThemeChange('dark')}
          className="flex flex-col items-center gap-2 py-4"
        >
          <Moon className="w-5 h-5" />
          <span className="text-sm">Oscuro</span>
        </Button>
        <Button
          variant={currentTheme === 'system' ? 'primary' : 'ghost'}
          onClick={() => handleThemeChange('system')}
          className="flex flex-col items-center gap-2 py-4"
        >
          <Monitor className="w-5 h-5" />
          <span className="text-sm">Sistema</span>
        </Button>
      </div>
    </div>
  );
}

