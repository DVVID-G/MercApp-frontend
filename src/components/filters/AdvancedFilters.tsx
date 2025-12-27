import React from 'react';
import { useFilters } from '../../hooks/useFilters';

export const AdvancedFilters: React.FC = () => {
  const { state, dispatch } = useFilters();

  return (
    <div className="space-y-2">
      <label className="block text-sm">Buscar</label>
      <input
        className="w-full p-2 bg-gray-950 border border-gray-800 rounded-[8px]"
        value={state.search}
        onChange={(e) => dispatch({ type: 'setSearch', payload: e.target.value })}
        placeholder="Buscar por producto..."
      />

      <div className="flex gap-2">
        <input
          type="number"
          className="flex-1 p-2 bg-gray-950 border border-gray-800 rounded-[8px]"
          placeholder="Min precio"
          value={state.priceRange.min ?? ''}
          onChange={(e) => dispatch({ type: 'setPriceRange', payload: { ...state.priceRange, min: e.target.value ? Number(e.target.value) : null } })}
        />
        <input
          type="number"
          className="flex-1 p-2 bg-gray-950 border border-gray-800 rounded-[8px]"
          placeholder="Max precio"
          value={state.priceRange.max ?? ''}
          onChange={(e) => dispatch({ type: 'setPriceRange', payload: { ...state.priceRange, max: e.target.value ? Number(e.target.value) : null } })}
        />
      </div>
    </div>
  );
};
