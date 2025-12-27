import { useState, useEffect } from 'react';
import React from 'react';
import { Search, ShoppingCart, Calendar, TrendingUp, Filter } from 'lucide-react';
import { Card } from './Card';
import { Input } from './Input';
import { Purchase } from '../App';
import { motion } from 'motion/react';
import { FiltersProvider, useFilters } from '../hooks/useFilters';
import { FilterPanel } from './filters/FilterPanel';
import { FilterSummary } from './filters/FilterSummary';
import { PaginationControls } from './filters/PaginationControls';
import { FilterErrorBoundary } from './filters/FilterErrorBoundary';
import { useFilteredPurchases } from '../hooks/usePurchaseFilter';
import { parseURLParams, serializeToURL } from '../utils/filterPersistence';

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
  const { state, dispatch } = useFilters();
  const { filtered, total, hasMore } = useFilteredPurchases(purchases);
  const [newlyLoadedStartIndex, setNewlyLoadedStartIndex] = useState<number | null>(null);
  const purchaseRefs = React.useRef<Map<string, HTMLDivElement>>(new Map());

  // Read URL params on mount (URL takes precedence over localStorage)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.toString()) {
      const urlFilters = parseURLParams(urlParams);
      if (Object.keys(urlFilters).length > 0) {
        dispatch({ type: 'restoreFromStorage', payload: urlFilters });
      }
    }
  }, []); // Only on mount

  // Update URL params when filters change
  useEffect(() => {
    const queryString = serializeToURL(state);
    const newURL = queryString
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname;
    
    // Use replaceState to avoid adding to history
    window.history.replaceState({}, '', newURL);
  }, [state]);

  // Handle smooth scroll to first new item after loading more
  const handleLoadMore = (previousCount: number) => {
    if (previousCount < filtered.length) {
      // Find the first newly loaded purchase
      const firstNewIndex = previousCount;
      setNewlyLoadedStartIndex(firstNewIndex);
      
      // Scroll to first new item smoothly
      setTimeout(() => {
        const firstNewPurchase = filtered[firstNewIndex];
        if (firstNewPurchase) {
          const element = purchaseRefs.current.get(firstNewPurchase.id);
          if (element) {
            element.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start',
              inline: 'nearest'
            });
          }
        }
        // Reset after animation completes
        setTimeout(() => setNewlyLoadedStartIndex(null), 500);
      }, 100);
    }
  };

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
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('[PurchaseHistory] Filter button clicked, current showFilters:', showFilters);
                setShowFilters((s) => {
                  const newValue = !s;
                  console.log('[PurchaseHistory] Setting showFilters to:', newValue);
                  return newValue;
                });
                // Blur the button immediately to prevent aria-hidden warning
                if (!showFilters) {
                  requestAnimationFrame(() => {
                    (document.activeElement as HTMLElement)?.blur();
                  });
                }
              }} 
              className="px-4 py-2 rounded-[8px] border border-gray-800 hover:border-gray-700 transition-colors flex items-center gap-2"
              aria-label="Abrir panel de filtros"
              type="button"
            >
              <Filter className="w-4 h-4" />
              Filtros
            </button>
            <div className="flex-1" />
          </div>
          
          {/* Filter Summary */}
          <FilterErrorBoundary>
            <FilterSummary />
          </FilterErrorBoundary>
          
          {/* Aria-live region for results count updates */}
          <div 
            aria-live="polite" 
            aria-atomic="true" 
            className="sr-only"
          >
            {filtered.length > 0 && (
              <span>
                {filtered.length} {filtered.length === 1 ? 'compra encontrada' : 'compras encontradas'}
                {total !== purchases.length && ` de ${total} compras filtradas`}
              </span>
            )}
          </div>
        </motion.div>
        
        {/* Filter Panel - Render outside motion.div to avoid portal conflicts */}
        <FilterErrorBoundary>
          {/* Drawer must always be mounted for Vaul to work properly */}
          <FilterPanel isOpen={showFilters} onClose={() => setShowFilters(false)} />
        </FilterErrorBoundary>

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
                  {monthPurchases.map((purchase, index) => {
                    // Calculate global index for fade-in animation on newly loaded items
                    const globalIndex = filtered.findIndex(p => p.id === purchase.id);
                    const isNewlyLoaded = newlyLoadedStartIndex !== null && globalIndex >= newlyLoadedStartIndex;
                    
                    return (
                      <motion.div
                        key={purchase.id}
                        ref={(el) => {
                          if (el) {
                            purchaseRefs.current.set(purchase.id, el);
                          } else {
                            purchaseRefs.current.delete(purchase.id);
                          }
                        }}
                        initial={isNewlyLoaded ? { opacity: 0, y: 20 } : { opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        transition={
                          isNewlyLoaded
                            ? {
                                duration: 0.4,
                                ease: 'easeOut',
                                delay: (globalIndex - (newlyLoadedStartIndex || 0)) * 0.05
                              }
                            : { delay: 0.4 + groupIndex * 0.1 + index * 0.05 }
                        }
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
                    );
                  })}
                </div>
              </motion.div>
            ))}
            <FilterErrorBoundary>
              <PaginationControls purchases={purchases} onLoadMore={handleLoadMore} />
            </FilterErrorBoundary>
          </div>
        )}
      </div>
    </div>
  );
}

