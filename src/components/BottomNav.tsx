import { Home, ShoppingCart, ScanBarcode, User } from 'lucide-react';
import { Screen } from '../App';
import { motion } from 'motion/react';

interface BottomNavProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export function BottomNav({ currentScreen, onNavigate }: BottomNavProps) {
  const navItems = [
    { id: 'dashboard' as Screen, label: 'Dashboard', icon: Home },
    { id: 'history' as Screen, label: 'Compras', icon: ShoppingCart },
    { id: 'scanner' as Screen, label: 'Escanear', icon: ScanBarcode },
    { id: 'profile' as Screen, label: 'Perfil', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-[390px] mx-auto bg-gray-950 border-t border-gray-800 px-4 py-3 safe-area-bottom z-[60]">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center gap-1 min-w-[60px]"
            >
              <div className={`p-2 rounded-[8px] transition-colors ${isActive ? 'bg-secondary-gold/10' : ''}`}>
                <Icon 
                  className={`w-5 h-5 transition-colors ${isActive ? 'text-secondary-gold' : 'text-gray-400'}`} 
                />
              </div>
              <span className={`text-xs transition-colors ${isActive ? 'text-secondary-gold' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
