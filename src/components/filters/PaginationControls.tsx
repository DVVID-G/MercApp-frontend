import React from 'react';
import { useFilters } from '../../hooks/useFilters';
import { useFilteredPurchases } from '../../hooks/usePurchaseFilter';

export const PaginationControls: React.FC<{ purchases: any[] }> = ({ purchases }) => {
  const { state, dispatch } = useFilters();
  const { total, hasMore, loadMore } = useFilteredPurchases(purchases);

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
        <div>Mostrando {Math.min(state.page * state.pageSize, total)} de {total}</div>
        {hasMore && <div>{total - state.page * state.pageSize} restantes</div>}
      </div>
      {hasMore && (
        <button onClick={loadMore} className="w-full px-4 py-3 rounded-[12px] bg-primary-black border-2 border-secondary-gold text-white">Cargar más</button>
      )}
    </div>
  );
};
