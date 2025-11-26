import { useState } from 'react';
import { Search, ShoppingCart, Calendar, TrendingUp, Filter } from 'lucide-react';
import { Card } from './Card';
import { Input } from './Input';
import { Purchase } from '../App';
import { motion } from 'motion/react';

interface PurchaseHistoryProps {
  purchases: Purchase[];
  onViewDetail: (purchase: Purchase) => void;
}

export function PurchaseHistory({ purchases, onViewDetail }: PurchaseHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');

  // Filter and sort purchases
  let filteredPurchases = purchases.filter(p => {
    const searchLower = searchQuery.toLowerCase();
    return p.products.some(prod => prod.name.toLowerCase().includes(searchLower));
  });

  if (sortBy === 'date') {
    filteredPurchases = [...filteredPurchases].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } else {
    filteredPurchases = [...filteredPurchases].sort((a, b) => b.total - a.total);
  }

  // Group by month
  const groupedByMonth = filteredPurchases.reduce((groups, purchase) => {
    const date = new Date(purchase.date);
    const monthKey = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    
    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    groups[monthKey].push(purchase);
    return groups;
  }, {} as Record<string, Purchase[]>);

  const totalSpent = purchases.reduce((sum, p) => sum + p.total, 0);

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-gray-950 to-primary-black px-6 pt-12 pb-6 sticky top-0 z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="mb-2">Historial</h1>
          <p className="text-gray-400">Todas tus compras registradas</p>
        </motion.div>
      </div>

      <div className="px-6">
        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="bg-gradient-to-br from-secondary-gold/10 to-secondary-gold/5 border-secondary-gold/30">
            <div className="flex items-center justify-between">
              <div>
                <small className="text-gray-400 block mb-1">Total acumulado</small>
                <h2 className="text-secondary-gold">${totalSpent.toFixed(2)}</h2>
              </div>
              <div className="text-right">
                <small className="text-gray-400 block mb-1">Compras totales</small>
                <p className="text-2xl text-white">{purchases.length}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Search & Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 space-y-3"
        >
          <Input
            label="Buscar"
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Buscar por producto..."
            icon={Search}
          />

          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('date')}
              className={`flex-1 px-4 py-2 rounded-[8px] border transition-colors ${
                sortBy === 'date' 
                  ? 'bg-secondary-gold/10 border-secondary-gold text-secondary-gold' 
                  : 'bg-gray-950 border-gray-800 text-gray-400'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Por fecha
            </button>
            <button
              onClick={() => setSortBy('amount')}
              className={`flex-1 px-4 py-2 rounded-[8px] border transition-colors ${
                sortBy === 'amount' 
                  ? 'bg-secondary-gold/10 border-secondary-gold text-secondary-gold' 
                  : 'bg-gray-950 border-gray-800 text-gray-400'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-2" />
              Por monto
            </button>
          </div>
        </motion.div>

        {/* Purchases List */}
        {filteredPurchases.length === 0 ? (
          <Card className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">
              {searchQuery ? 'No se encontraron resultados' : 'No tienes compras registradas'}
            </p>
            <small className="text-gray-600">
              {searchQuery ? 'Intenta con otros términos de búsqueda' : 'Crea tu primera compra para comenzar'}
            </small>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByMonth).map(([month, monthPurchases], groupIndex) => (
              <motion.div
                key={month}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + groupIndex * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <h4 className="text-secondary-gold capitalize">{month}</h4>
                  <div className="flex-1 h-px bg-gray-800" />
                  <small className="text-gray-600">{monthPurchases.length}</small>
                </div>

                <div className="space-y-3">
                  {monthPurchases.map((purchase, index) => (
                    <motion.div
                      key={purchase.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + groupIndex * 0.1 + index * 0.05 }}
                    >
                      <Card onClick={() => onViewDetail(purchase)}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="text-white">
                                {new Date(purchase.date).toLocaleDateString('es-ES', { 
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </p>
                              {!purchase.synced && (
                                <span className="px-2 py-0.5 bg-warning/10 border border-warning/30 rounded-[4px] text-warning text-xs">
                                  Pendiente
                                </span>
                              )}
                            </div>
                            <small className="text-gray-400">
                              {purchase.itemCount} {purchase.itemCount === 1 ? 'producto' : 'productos'}
                            </small>
                            
                            {/* Product preview */}
                            <div className="mt-2 flex flex-wrap gap-1">
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
                          
                          <div className="text-right">
                            <p className="text-secondary-gold text-xl">
                              ${purchase.total.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
