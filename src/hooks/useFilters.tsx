import React, { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import { DEFAULT_FILTER_STATE, FilterState } from '../types/filters';
import { serializeFilters, deserializeFilters, FILTERS_STORAGE_KEY } from '../utils/filterPersistence';
import { useDebounce } from 'use-debounce';

/**
 * Action types for filter state management.
 * All filter changes reset pagination to page 1 except setPage and setPageSize.
 */
type Action =
  | { type: 'setDateRange'; payload: FilterState['dateRange'] } // Sets date range filter and resets to page 1
  | { type: 'setSort'; payload: FilterState['sort'] } // Sets sort criteria and resets to page 1
  | { type: 'setSearch'; payload: string } // Sets search query and resets to page 1
  | { type: 'setPriceRange'; payload: FilterState['priceRange'] } // Sets price range filter and resets to page 1
  | { type: 'setBrands'; payload: string[] } // Sets selected brands and resets to page 1
  | { type: 'setCategories'; payload: string[] } // Sets selected categories and resets to page 1
  | { type: 'setPage'; payload: number } // Changes current page (does not reset filters)
  | { type: 'reset' } // Resets all filters to default state
  | { type: 'setPageSize'; payload: number } // Changes page size (does not reset filters)
  | { type: 'restoreFromStorage'; payload: Partial<FilterState> }; // Restores filter state from localStorage/URL

/**
 * Reducer function for filter state management.
 * Handles all filter actions and automatically resets pagination when filters change.
 * 
 * @param state - Current filter state
 * @param action - Action to apply
 * @returns New filter state
 */
const reducer = (state: FilterState, action: Action): FilterState => {
  switch (action.type) {
    case 'setDateRange':
      // Set date range and reset pagination to page 1
      return { ...state, dateRange: action.payload, page: 1 };
    case 'setSort':
      // Set sort criteria and reset pagination to page 1
      return { ...state, sort: action.payload, page: 1 };
    case 'setSearch':
      // Set search query and reset pagination to page 1
      return { ...state, search: action.payload, page: 1 };
    case 'setPriceRange':
      // Set price range and reset pagination to page 1
      return { ...state, priceRange: action.payload, page: 1 };
    case 'setBrands':
      // Set selected brands and reset pagination to page 1
      return { ...state, brands: action.payload, page: 1 };
    case 'setCategories':
      // Set selected categories and reset pagination to page 1
      return { ...state, categories: action.payload, page: 1 };
    case 'setPage':
      // Change current page without affecting filters
      return { ...state, page: action.payload };
    case 'setPageSize':
      // Change page size without affecting filters
      return { ...state, pageSize: action.payload };
    case 'reset':
      // Reset all filters to default state
      return { ...DEFAULT_FILTER_STATE };
    case 'restoreFromStorage':
      // Restore filter state from storage (localStorage or URL params)
      return { ...DEFAULT_FILTER_STATE, ...action.payload };
    default:
      return state;
  }
};

const FiltersContext = createContext<{
  state: FilterState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

/**
 * Provider component that manages filter state using React Context and useReducer.
 * Automatically loads saved filters from localStorage on mount and persists changes
 * with a 500ms debounce to avoid excessive writes.
 * 
 * @example
 * ```tsx
 * <FiltersProvider>
 *   <PurchaseHistory />
 * </FiltersProvider>
 * ```
 */
export const FiltersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from localStorage if available
  const [state, dispatch] = useReducer(reducer, DEFAULT_FILTER_STATE, (init) => {
    try {
      const raw = localStorage.getItem(FILTERS_STORAGE_KEY);
      if (raw) {
        const deserialized = deserializeFilters(raw);
        if (deserialized) {
          return { ...init, ...deserialized };
        }
      }
    } catch (e) {
      console.warn('Failed to load filters from localStorage:', e);
    }
    return init;
  });

  // Debounce state for persistence (500ms delay) to avoid excessive localStorage writes
  const [debouncedState] = useDebounce(state, 500);
  const isInitialMount = useRef(true);

  // Persist to localStorage (debounced)
  useEffect(() => {
    // Skip persistence on initial mount to avoid overwriting with default state
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    try {
      const serialized = serializeFilters(debouncedState);
      localStorage.setItem(FILTERS_STORAGE_KEY, serialized);
    } catch (e) {
      // Ignore quota errors gracefully
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded, filters not persisted');
      }
    }
  }, [debouncedState]);

  return <FiltersContext.Provider value={{ state, dispatch }}>{children}</FiltersContext.Provider>;
};

/**
 * Hook to access filter state and dispatch actions.
 * Must be used within a FiltersProvider.
 * 
 * @returns Object with filter state and dispatch function
 * @throws Error if used outside FiltersProvider
 * 
 * @example
 * ```tsx
 * const { state, dispatch } = useFilters();
 * dispatch({ type: 'setDateRange', payload: { start: '2024-01-01', end: '2024-01-31', preset: 'custom' } });
 * ```
 */
export function useFilters() {
  const ctx = useContext(FiltersContext);
  if (!ctx) throw new Error('useFilters must be used within FiltersProvider');
  return ctx;
}
