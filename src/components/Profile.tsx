import { useState, useEffect } from 'react';
import { User, LogOut, Settings, Bell, Shield, HelpCircle, ChevronRight } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { motion, AnimatePresence } from 'motion/react';
import { getMeRequest } from '../services/auth.service';
import { getAnalyticsOverview, AnalyticsOverview } from '../services/analytics.service';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { CartButton } from './CartButton';

interface ProfileProps {
  onLogout: () => void;
  onOpenCart: () => void;
}

const COLORS = ['#d4af37', '#2ecc71', '#e74c3c', '#f1c40f', '#9b59b6', '#3498db'];

export function Profile({ onLogout, onOpenCart }: ProfileProps) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [stats, setStats] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [userData, statsData] = await Promise.all([
          getMeRequest(),
          getAnalyticsOverview()
        ]);
        setUser(userData);
        setStats(statsData);
      } catch (error) {
        console.error('Failed to load profile data', error);
        toast.error('Error al cargar datos del perfil');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

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
        <div className="flex items-start justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1"
          >
            <h1 className="mb-2">Perfil</h1>
            <p className="text-gray-400">Gestiona tu cuenta</p>
          </motion.div>
          <CartButton onClick={onOpenCart} />
        </div>
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
                {loading ? (
                  <div className="space-y-2 animate-pulse">
                    <div className="h-6 bg-gray-800 rounded w-32"></div>
                    <div className="h-4 bg-gray-800 rounded w-48"></div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-white mb-1">{user?.name || 'Usuario'}</h3>
                    <small className="text-gray-400">{user?.email || 'Sin correo'}</small>
                    <div className="mt-2">
                      <span className="px-3 py-1 bg-secondary-gold/20 border border-secondary-gold/30 rounded-[6px] text-secondary-gold text-xs">
                        Miembro
                      </span>
                    </div>
                  </>
                )}
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
          <h3 className="mb-3">Estadísticas (Últimos 6 meses)</h3>
          <div className="grid grid-cols-2 gap-3">
             {loading ? (
               <>
                 <Card className="h-24 animate-pulse bg-gray-900">
                   <div />
                 </Card>
                 <Card className="h-24 animate-pulse bg-gray-900">
                   <div />
                 </Card>
               </>
             ) : (
               <>
                <Card className="text-center p-3">
                  <p className="text-xl text-secondary-gold mb-1">
                    ${stats?.monthly[stats.monthly.length - 1]?.total.toLocaleString() || '0'}
                  </p>
                  <small className="text-gray-400 text-xs">Gasto este mes</small>
                </Card>
                <Card className="text-center p-3">
                  <p className="text-xl text-white mb-1">
                    {stats?.categories[0]?.category || '-'}
                  </p>
                  <small className="text-gray-400 text-xs">Top Categoría</small>
                </Card>
               </>
             )}
          </div>
        </motion.div>

        {/* Advanced Stats */}
        {!loading && stats && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-6 space-y-6"
          >
            <h3 className="mb-3">Análisis Detallado</h3>

            {/* Monthly Comparison & Projection */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-3">
                <small className="text-gray-400 text-xs block mb-1">Comparativa Mensual</small>
                <div className="flex items-end gap-2">
                  <span className={`text-lg font-bold ${stats.monthlyComparison.percentageChange >= 0 ? 'text-error' : 'text-success'}`}>
                    {stats.monthlyComparison.percentageChange > 0 ? '+' : ''}{stats.monthlyComparison.percentageChange.toFixed(1)}%
                  </span>
                  <span className="text-xs text-gray-500 mb-1">vs mes anterior</span>
                </div>
              </Card>
              <Card className="p-3">
                <small className="text-gray-400 text-xs block mb-1">Proyección Fin de Mes</small>
                <p className="text-lg font-bold text-white">${stats.spendingProjection.toLocaleString()}</p>
              </Card>
            </div>

            <Card className="p-3">
              <small className="text-gray-400 text-xs block mb-1">Frecuencia de Compra</small>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-secondary-gold">{stats.purchaseFrequency}</span>
                <span className="text-sm text-gray-400">días promedio entre compras</span>
              </div>
            </Card>

            {/* Spending by Day of Week */}
            <Card className="p-4">
              <h4 className="text-sm font-medium text-white mb-4">Gastos por Día</h4>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.spendingByDayOfWeek}>
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9ca3af' }} interval={0} />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="total" fill="#d4af37" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Brand Distribution */}
            <Card className="p-4">
              <h4 className="text-sm font-medium text-white mb-4">Top Marcas</h4>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.brandDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="total"
                    >
                      {stats.brandDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {stats.brandDistribution.slice(0, 4).map((brand, index) => (
                  <div key={brand.brand} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-xs text-gray-400 truncate">{brand.brand}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

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
