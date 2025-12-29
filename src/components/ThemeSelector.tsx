import { useEffect, useState } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from 'next-themes';
import { Button } from './Button';

export function ThemeSelector() {
  const { preferences, updatePreferences } = useSettings();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && preferences?.theme) {
      setTheme(preferences.theme);
    }
  }, [mounted, preferences?.theme, setTheme]);

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
    const themeNames = {
      light: 'Claro',
      dark: 'Oscuro',
      system: 'Sistema'
    };
    
    setTheme(newTheme);
    setAnnouncement(`Tema cambiado a ${themeNames[newTheme]}`);
    
    try {
      await updatePreferences({ theme: newTheme });
    } catch (error) {
      // Revert on error
      if (preferences?.theme) {
        setTheme(preferences.theme);
        setAnnouncement('Error al cambiar el tema. Se revirtió el cambio.');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, theme: 'light' | 'dark' | 'system') => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleThemeChange(theme);
    }
  };

  if (!mounted) {
    return (
      <div className="flex gap-2" role="status" aria-label="Cargando selector de tema">
        <div className="flex-1 h-12 bg-gray-800 rounded animate-pulse" aria-hidden="true"></div>
        <div className="flex-1 h-12 bg-gray-800 rounded animate-pulse" aria-hidden="true"></div>
        <div className="flex-1 h-12 bg-gray-800 rounded animate-pulse" aria-hidden="true"></div>
      </div>
    );
  }

  const currentTheme = preferences?.theme || 'system';

  return (
    <div className="flex flex-col gap-3">
      <label 
        id="theme-label" 
        className="text-sm text-gray-400 mb-2"
        htmlFor="theme-selector"
      >
        Tema
      </label>
      <div
        id="theme-selector"
        role="radiogroup"
        aria-labelledby="theme-label"
        aria-label="Seleccionar tema de la aplicación"
        className="grid grid-cols-3 gap-2 sm:gap-3"
      >
        <Button
          variant={currentTheme === 'light' ? 'primary' : 'ghost'}
          onClick={() => handleThemeChange('light')}
          onKeyDown={(e) => handleKeyDown(e, 'light')}
          className="flex flex-col items-center gap-2 py-4 min-h-[44px] min-w-[44px] focus-visible:outline-2 focus-visible:outline-secondary-gold focus-visible:outline-offset-2"
          role="radio"
          aria-checked={currentTheme === 'light'}
          aria-label="Tema claro"
        >
          <Sun className="w-5 h-5" aria-hidden="true" />
          <span className="text-sm">Claro</span>
        </Button>
        <Button
          variant={currentTheme === 'dark' ? 'primary' : 'ghost'}
          onClick={() => handleThemeChange('dark')}
          onKeyDown={(e) => handleKeyDown(e, 'dark')}
          className="flex flex-col items-center gap-2 py-4 min-h-[44px] min-w-[44px] focus-visible:outline-2 focus-visible:outline-secondary-gold focus-visible:outline-offset-2"
          role="radio"
          aria-checked={currentTheme === 'dark'}
          aria-label="Tema oscuro"
        >
          <Moon className="w-5 h-5" aria-hidden="true" />
          <span className="text-sm">Oscuro</span>
        </Button>
        <Button
          variant={currentTheme === 'system' ? 'primary' : 'ghost'}
          onClick={() => handleThemeChange('system')}
          onKeyDown={(e) => handleKeyDown(e, 'system')}
          className="flex flex-col items-center gap-2 py-4 min-h-[44px] min-w-[44px] focus-visible:outline-2 focus-visible:outline-secondary-gold focus-visible:outline-offset-2"
          role="radio"
          aria-checked={currentTheme === 'system'}
          aria-label="Tema del sistema"
        >
          <Monitor className="w-5 h-5" aria-hidden="true" />
          <span className="text-sm">Sistema</span>
        </Button>
      </div>
      {announcement && (
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {announcement}
        </div>
      )}
    </div>
  );
}

