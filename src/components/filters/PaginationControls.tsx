import React from 'react';
import { useFilters } from '../../hooks/useFilters';
import { useFilteredPurchases } from '../../hooks/usePurchaseFilter';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { Purchase } from '../../App';

interface PaginationControlsProps {
  purchases: Purchase[];
  onLoadMore?: (previousCount: number) => void;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({ purchases, onLoadMore }) => {
  const { state, dispatch } = useFilters();
  const { filtered, total, hasMore, loadMore } = useFilteredPurchases(purchases);
  const [isLoading, setIsLoading] = React.useState(false);

  const loadedItems = Math.min(state.page * state.pageSize, total);
  const remainingItems = total - loadedItems;

  const handleLoadMore = async () => {
    const previousCount = loadedItems;
    setIsLoading(true);
    // Simulate async loading (in real app, this might fetch from API)
    await new Promise((resolve) => setTimeout(resolve, 100));
    loadMore();
    setIsLoading(false);
    
    // Notify parent component about the load more action
    if (onLoadMore) {
      // Use setTimeout to ensure DOM has updated
      setTimeout(() => {
        onLoadMore(previousCount);
      }, 50);
    }
  };

  if (total === 0) {
    return null;
  }

  return (
    <div className="mt-6 space-y-3">
      {/* Progress Display */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">
          Mostrando <span className="font-semibold text-white">{loadedItems}</span> de{' '}
          <span className="font-semibold text-white">{total}</span> compras
        </span>
        {hasMore && (
          <span className="text-gray-500">
            {remainingItems} {remainingItems === 1 ? 'restante' : 'restantes'}
          </span>
        )}
      </div>

      {/* Load More Button */}
      {hasMore ? (
        <motion.button
          onClick={handleLoadMore}
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full px-4 py-3 rounded-[12px] bg-primary-black border-2 border-secondary-gold text-white font-medium hover:bg-secondary-gold hover:text-primary-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          aria-label={`Cargar más compras (${remainingItems} restantes)`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Cargando...</span>
            </>
          ) : (
            <span>Cargar más ({remainingItems} restantes)</span>
          )}
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-4 text-sm text-gray-500"
        >
          Todas las compras cargadas
        </motion.div>
      )}
    </div>
  );
};
