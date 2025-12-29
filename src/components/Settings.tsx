import { useState, useEffect } from 'react';
import { ArrowLeft, Settings as SettingsIcon, UserCircle } from 'lucide-react';
import { Button } from './Button';
import { GeneralSettings } from './GeneralSettings';
import { AccountSettings } from './AccountSettings';
import { motion } from 'motion/react';

interface SettingsProps {
  onBack: () => void;
}

export function Settings({ onBack }: SettingsProps) {
  const [activeTab, setActiveTab] = useState('general');
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check for prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onBack();
    }
  };

  return (
    <div 
      className="min-h-screen pb-24"
      onKeyDown={handleKeyDown}
      role="main"
      aria-label="Configuración de usuario"
    >
      {/* Header */}
      <header className="bg-gradient-to-b from-gray-950 to-primary-black px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-6">
        <div className="flex items-center gap-3 sm:gap-4 mb-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Volver atrás"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </Button>
          <motion.div
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={reducedMotion ? {} : { duration: 0.3 }}
            className="flex-1"
          >
            <h1 id="settings-heading">Configuración</h1>
            <p className="text-gray-400" id="settings-description">
              Gestiona tus preferencias y cuenta
            </p>
          </motion.div>
        </div>
      </header>

      <div 
        id="settings-content"
        className="px-4 sm:px-6 lg:px-8"
        role="region"
        aria-labelledby="settings-heading"
        aria-describedby="settings-description"
      >
        {/* Custom Toggle Switch Selector */}
        <div className="mb-4 sm:mb-6">
          <div
            role="tablist"
            aria-label="Secciones de configuración"
            className="relative w-full border-2 border-secondary-gold rounded-[12px] p-1 flex gap-1 bg-gray-950 overflow-hidden"
          >
            {/* Animated Background Indicator */}
            <motion.div
              layoutId="activeTabIndicator"
              className="absolute top-1 bottom-1 bg-primary-black border-2 border-secondary-gold rounded-[10px] z-0"
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 35,
                mass: 0.8,
              }}
              style={{
                width: 'calc(50% - 4px)',
                left: activeTab === 'general' ? '4px' : 'calc(50% + 2px)',
              }}
            />
            
            {/* General Tab */}
            <button
              type="button"
              role="tab"
              aria-controls="general-panel"
              aria-selected={activeTab === 'general'}
              onClick={() => setActiveTab('general')}
              className={`relative z-10 flex-1 min-h-[48px] rounded-[10px] px-4 py-3 text-sm font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-secondary-gold focus-visible:outline-offset-2 border-2 flex items-center justify-center gap-2 ${
                activeTab === 'general'
                  ? 'bg-primary-black border-secondary-gold text-white font-semibold'
                  : 'bg-gray-800 border-gray-600 text-white hover:bg-gray-700 hover:border-gray-500'
              }`}
            >
              <SettingsIcon className="w-4 h-4" aria-hidden="true" />
              General
            </button>
            
            {/* Account Tab */}
            <button
              type="button"
              role="tab"
              aria-controls="account-panel"
              aria-selected={activeTab === 'account'}
              onClick={() => setActiveTab('account')}
              className={`relative z-10 flex-1 min-h-[48px] rounded-[10px] px-4 py-3 text-sm font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-secondary-gold focus-visible:outline-offset-2 border-2 flex items-center justify-center gap-2 ${
                activeTab === 'account'
                  ? 'bg-primary-black border-secondary-gold text-white font-semibold'
                  : 'bg-gray-800 border-gray-600 text-white hover:bg-gray-700 hover:border-gray-500'
              }`}
            >
              <UserCircle className="w-4 h-4" aria-hidden="true" />
              Cuenta
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="w-full">
          {activeTab === 'general' && (
            <div
              id="general-panel"
              role="tabpanel"
              aria-labelledby="general-tab"
              className="focus-visible:outline-2 focus-visible:outline-secondary-gold focus-visible:outline-offset-2 focus-visible:rounded"
            >
              <GeneralSettings />
            </div>
          )}
          
          {activeTab === 'account' && (
            <div
              id="account-panel"
              role="tabpanel"
              aria-labelledby="account-tab"
              className="focus-visible:outline-2 focus-visible:outline-secondary-gold focus-visible:outline-offset-2 focus-visible:rounded"
            >
              <AccountSettings />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

