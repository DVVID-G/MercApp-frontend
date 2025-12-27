import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { DEFAULT_FILTER_STATE, FILTERS_STORAGE_KEY, FilterState } from '../types/filters';

type Action =
  | { type: 'setDateRange'; payload: FilterState['dateRange'] }
  | { type: 'setSort'; payload: FilterState['sort'] }
  | { type: 'setSearch'; payload: string }
  | { type: 'setPriceRange'; payload: FilterState['priceRange'] }
  | { type: 'setPage'; payload: number }
  | { type: 'reset' }
  | { type: 'setPageSize'; payload: number };

const reducer = (state: FilterState, action: Action): FilterState => {
  switch (action.type) {
    case 'setDateRange':
      return { ...state, dateRange: action.payload, page: 1 };
    case 'setSort':
      return { ...state, sort: action.payload, page: 1 };
    case 'setSearch':
      return { ...state, search: action.payload, page: 1 };
    case 'setPriceRange':
      return { ...state, priceRange: action.payload, page: 1 };
    case 'setPage':
      return { ...state, page: action.payload };
    case 'setPageSize':
      return { ...state, pageSize: action.payload };
    case 'reset':
      return { ...DEFAULT_FILTER_STATE };
    default:
      return state;
  }
};

const FiltersContext = createContext<{
  state: FilterState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export const FiltersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, DEFAULT_FILTER_STATE, (init) => {
    try {
      const raw = localStorage.getItem(FILTERS_STORAGE_KEY);
      if (raw) return { ...init, ...JSON.parse(raw) };
    } catch (e) {
      // ignore
    }
    return init;
  });

  // persist
  useEffect(() => {
    try {
      localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // ignore quota errors
    }
  }, [state]);

  return <FiltersContext.Provider value={{ state, dispatch }}>{children}</FiltersContext.Provider>;
};

export function useFilters() {
  const ctx = useContext(FiltersContext);
  if (!ctx) throw new Error('useFilters must be used within FiltersProvider');
  return ctx;
}
