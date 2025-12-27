import React from 'react';
import { useFilters } from '../../hooks/useFilters';

export const FilterSummary: React.FC = () => {
  const { state, dispatch } = useFilters();

  const clearAll = () => dispatch({ type: 'reset' });

  const clearSearch = () => dispatch({ type: 'setSearch', payload: '' });

  return (
    <div className="flex items-center gap-2">
      {state.dateRange.preset && <span className="px-2 py-1 bg-gray-800 rounded-[6px] text-xs">Fecha: {state.dateRange.preset}</span>}
      {state.search && <button onClick={clearSearch} className="px-2 py-1 bg-gray-800 rounded-[6px] text-xs">Buscar: {state.search} ✕</button>}
      {(state.priceRange.min != null || state.priceRange.max != null) && (
        <span className="px-2 py-1 bg-gray-800 rounded-[6px] text-xs">Precio: {state.priceRange.min ?? '-'} - {state.priceRange.max ?? '-'}</span>
      )}
      <div className="flex-1" />
      <button onClick={clearAll} className="text-sm text-gray-400">Limpiar filtros</button>
    </div>
  );
};
