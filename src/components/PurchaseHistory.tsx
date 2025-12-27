import { useState } from 'react';
import { Search, ShoppingCart, Calendar, TrendingUp } from 'lucide-react';
import { Card } from './Card';
import { Input } from './Input';
import { Purchase } from '../App';
import { motion } from 'motion/react';
import { FiltersProvider, useFilters } from '../hooks/useFilters';
import { FilterPanel } from './filters/FilterPanel';
import { PaginationControls } from './filters/PaginationControls';
import { useFilteredPurchases } from '../hooks/usePurchaseFilter';

interface PurchaseHistoryProps {
  purchases: Purchase[];
  onViewDetail: (purchase: Purchase) => void;
}

export function PurchaseHistory({ purchases, onViewDetail }: PurchaseHistoryProps) {
  // local UI state
  const [showFilters, setShowFilters] = useState(false);

  // Group by month
  // Use FiltersProvider internally for this view
  return (
    <FiltersProvider>
      <InnerPurchaseHistory purchases={purchases} onViewDetail={onViewDetail} showFilters={showFilters} setShowFilters={setShowFilters} />
    </FiltersProvider>
  );
}

function InnerPurchaseHistory({ purchases, onViewDetail, showFilters, setShowFilters }: PurchaseHistoryProps & { showFilters: boolean; setShowFilters: (v: boolean) => void }) {
  const { state } = useFilters();
  const { filtered, total, hasMore } = useFilteredPurchases(purchases);

  const groupedByMonth = filtered.reduce((groups, purchase) => {
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
          <div className="flex items-center gap-2">
            <button onClick={() => setShowFilters((s) => !s)} className="px-4 py-2 rounded-[8px] border border-gray-800">Filtros</button>
            <div className="flex-1" />
            <FilterSummaryPlaceholder />
          </div>
          {showFilters && (
            <div className="mt-3">
              <FilterPanel purchases={purchases} />
            </div>
          )}
        </motion.div>

        {/* Purchases List */}
        {filtered.length === 0 ? (
          <Card className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">No hay compras que coincidan con los filtros</p>
            <small className="text-gray-600">Ajusta filtros o limpia para ver todas las compras</small>
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
                            <p className="text-secondary-gold text-xl whitespace-nowrap">${purchase.total.toFixed(2)}</p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
            <PaginationControls purchases={purchases} />
          </div>
        )}
      </div>
    </div>
  );
}

function FilterSummaryPlaceholder() {
  // simple placeholder kept inside PurchaseHistory header
  return <div className="text-sm text-gray-400">Filtros activos</div>;
}
