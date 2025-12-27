import React from 'react';
import { useFilters } from '../../hooks/useFilters';

export const SortSelector: React.FC = () => {
  const { state, dispatch } = useFilters();

  const setField = (field: 'date' | 'amount' | 'items') => {
    dispatch({ type: 'setSort', payload: { ...state.sort, field } });
  };

  const toggleDir = () => {
    dispatch({ type: 'setSort', payload: { ...state.sort, direction: state.sort.direction === 'asc' ? 'desc' : 'asc' } });
  };

  return (
    <div className="flex gap-2">
      <button onClick={() => setField('date')} className={`flex-1 px-3 py-2 rounded-[8px] border ${state.sort.field === 'date' ? 'border-secondary-gold text-secondary-gold' : 'border-gray-800 text-gray-400'}`}>Fecha</button>
      <button onClick={() => setField('amount')} className={`flex-1 px-3 py-2 rounded-[8px] border ${state.sort.field === 'amount' ? 'border-secondary-gold text-secondary-gold' : 'border-gray-800 text-gray-400'}`}>Monto</button>
      <button onClick={() => setField('items')} className={`flex-1 px-3 py-2 rounded-[8px] border ${state.sort.field === 'items' ? 'border-secondary-gold text-secondary-gold' : 'border-gray-800 text-gray-400'}`}>Artículos</button>
      <button onClick={toggleDir} className="px-3 py-2 rounded-[8px] border border-gray-800 text-sm">{state.sort.direction === 'asc' ? 'Asc' : 'Desc'}</button>
    </div>
  );
};
