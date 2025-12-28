import { Plus, TrendingUp, ShoppingCart, DollarSign, WifiOff } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { motion } from 'motion/react';
import { Purchase } from '../App';
import { CartButton } from './CartButton';

interface DashboardProps {
  purchases: Purchase[];
  onCreatePurchase: () => void;
  onViewDetail: (purchase: Purchase) => void;
  onOpenCart: () => void;
  isOffline: boolean;
}

export function Dashboard({ purchases, onCreatePurchase, onViewDetail, onOpenCart, isOffline }: DashboardProps) {
  // Calculate statistics
  const totalSpent = purchases.reduce((sum, p) => sum + p.total, 0);
  const totalItems = purchases.reduce((sum, p) => sum + p.itemCount, 0);
  const avgPurchase = purchases.length > 0 ? totalSpent / purchases.length : 0;

  const recentPurchases = purchases.slice(0, 3);

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-gray-950 to-primary-black px-6 pt-12 pb-8">
        <div className="flex items-start justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1"
          >
            <h1 className="mb-2">Dashboard</h1>
            <p className="text-gray-400">Resumen de tus compras</p>
          </motion.div>
          <CartButton onClick={onOpenCart} />
        </div>

        {/* Offline Banner */}
        {isOffline && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-warning/10 border border-warning/30 rounded-[12px] p-3 flex items-center gap-3"
          >
            <WifiOff className="w-5 h-5 text-warning" />
            <div>
              <p className="text-warning text-sm">Modo sin conexión</p>
              <small className="text-warning/70">Los cambios se sincronizarán automáticamente</small>
            </div>
          </motion.div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="px-6 -mt-4">
        <div className="grid grid-cols-2 gap-3 mb-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="text-center">
              <div className="w-10 h-10 bg-secondary-gold/10 rounded-[10px] flex items-center justify-center mx-auto mb-2">
                <DollarSign className="w-5 h-5 text-secondary-gold" />
              </div>
              <p className="text-2xl text-secondary-gold mb-1">${totalSpent.toFixed(2)}</p>
              <small className="text-gray-400">Total gastado</small>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="text-center">
              <div className="w-10 h-10 bg-success/10 rounded-[10px] flex items-center justify-center mx-auto mb-2">
                <ShoppingCart className="w-5 h-5 text-success" />
              </div>
              <p className="text-2xl text-white mb-1">{purchases.length}</p>
              <small className="text-gray-400">Compras</small>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="text-center">
              <div className="w-10 h-10 bg-blue-500/10 rounded-[10px] flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-2xl text-white mb-1">{totalItems}</p>
              <small className="text-gray-400">Productos</small>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="text-center">
              <div className="w-10 h-10 bg-purple-500/10 rounded-[10px] flex items-center justify-center mx-auto mb-2">
                <DollarSign className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-2xl text-white mb-1">${avgPurchase.toFixed(2)}</p>
              <small className="text-gray-400">Promedio</small>
            </Card>
          </motion.div>
        </div>

        {/* Quick Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          <Button 
            onClick={onCreatePurchase} 
            variant="primary" 
            icon={Plus}
            fullWidth
          >
            Crear compra
          </Button>
        </motion.div>

        {/* Recent Purchases */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3>Compras recientes</h3>
          </div>

          {recentPurchases.length === 0 ? (
            <Card className="text-center py-8">
              <ShoppingCart className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 mb-1">No tienes compras registradas aún</p>
              <small className="text-gray-600">Crea tu primera compra para comenzar</small>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentPurchases.map((purchase, index) => (
                <motion.div
                  key={purchase.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="w-full"
                >
                  <Card onClick={() => onViewDetail(purchase)} className="w-full">
                    <div className="flex items-center justify-between w-full gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="text-white">
                            {new Date(purchase.date).toLocaleDateString('es-ES', { 
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                          {!purchase.synced && (
                            <span className="px-2 py-0.5 bg-warning/10 border border-warning/30 rounded-[4px] text-warning text-xs flex-shrink-0">
                              Pendiente
                            </span>
                          )}
                        </div>
                        <small className="text-gray-400 block mb-1">
                          {purchase.itemCount} {purchase.itemCount === 1 ? 'producto' : 'productos'}
                        </small>
                        
                        {/* Product preview */}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {purchase.products.slice(0, 3).map(p => (
                            <span key={p.id} className="px-2 py-1 bg-gray-800 rounded-[4px] text-xs text-gray-400">
                              {p.name}
                            </span>
                          ))}
                          {purchase.products.length > 3 && (
                            <span className="px-2 py-1 bg-gray-800 rounded-[4px] text-xs text-gray-400">
                              +{purchase.products.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right flex-shrink-0">
                        <p className="text-secondary-gold text-xl whitespace-nowrap">
                          ${purchase.total.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
