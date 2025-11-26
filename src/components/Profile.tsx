import { useState } from 'react';
import { User, LogOut, Settings, Bell, Shield, HelpCircle, ChevronRight } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { motion, AnimatePresence } from 'motion/react';

interface ProfileProps {
  onLogout: () => void;
}

export function Profile({ onLogout }: ProfileProps) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const menuItems = [
    { icon: Settings, label: 'Configuración', badge: null },
    { icon: Bell, label: 'Notificaciones', badge: '3' },
    { icon: Shield, label: 'Privacidad y seguridad', badge: null },
    { icon: HelpCircle, label: 'Ayuda y soporte', badge: null },
  ];

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    setTimeout(() => onLogout(), 300);
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-gray-950 to-primary-black px-6 pt-12 pb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="mb-2">Perfil</h1>
          <p className="text-gray-400">Gestiona tu cuenta</p>
        </motion.div>
      </div>

      <div className="px-6">
        {/* User Info Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="bg-gradient-to-br from-secondary-gold/10 to-secondary-gold/5 border-secondary-gold/30">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-secondary-gold rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary-black" />
              </div>
              <div className="flex-1">
                <h3 className="text-white mb-1">Usuario Demo</h3>
                <small className="text-gray-400">demo@mercapp.com</small>
                <div className="mt-2">
                  <span className="px-3 py-1 bg-secondary-gold/20 border border-secondary-gold/30 rounded-[6px] text-secondary-gold text-xs">
                    Premium
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h3 className="mb-3">Estadísticas</h3>
          <div className="grid grid-cols-3 gap-3">
            <Card className="text-center">
              <p className="text-2xl text-secondary-gold mb-1">24</p>
              <small className="text-gray-400">Compras</small>
            </Card>
            <Card className="text-center">
              <p className="text-2xl text-white mb-1">156</p>
              <small className="text-gray-400">Productos</small>
            </Card>
            <Card className="text-center">
              <p className="text-2xl text-white mb-1">45</p>
              <small className="text-gray-400">Días</small>
            </Card>
          </div>
        </motion.div>

        {/* Menu Items */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <h3 className="mb-3">Opciones</h3>
          <div className="space-y-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                >
                  <Card onClick={() => {}} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-800 rounded-[10px] flex items-center justify-center">
                        <Icon className="w-5 h-5 text-gray-400" />
                      </div>
                      <span className="text-white">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span className="px-2 py-1 bg-secondary-gold/10 border border-secondary-gold/30 rounded-[6px] text-secondary-gold text-xs">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            onClick={() => setShowLogoutModal(true)}
            variant="secondary"
            icon={LogOut}
            fullWidth
          >
            Cerrar sesión
          </Button>
        </motion.div>

        {/* App Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 text-center"
        >
          <small className="text-gray-600">MercApp v1.0.0</small>
          <p className="text-gray-600 text-xs mt-1">© 2025 MercApp. Todos los derechos reservados.</p>
        </motion.div>
      </div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutModal(false)}
              className="fixed inset-0 bg-black/60 z-40"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-48px)] max-w-[342px] bg-gray-950 border border-gray-800 rounded-[20px] p-6 z-50"
            >
              <div className="w-12 h-12 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-6 h-6 text-error" />
              </div>
              
              <h3 className="text-center text-white mb-2">¿Cerrar sesión?</h3>
              <p className="text-center text-gray-400 text-sm mb-6">
                ¿Estás seguro que deseas cerrar tu sesión? Tendrás que volver a iniciar sesión para acceder.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="ghost" onClick={() => setShowLogoutModal(false)}>
                  Cancelar
                </Button>
                <Button variant="primary" onClick={handleLogoutConfirm}>
                  Confirmar
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
