import React, { createContext, useContext, useReducer } from 'react';
import {
  ProductFilterState,
  ProductFilterAction,
  productFilterReducer,
  DEFAULT_PRODUCT_FILTER_STATE
} from '../types/productFilters';

const ProductFiltersContext = createContext<{
  state: ProductFilterState;
  dispatch: React.Dispatch<ProductFilterAction>;
} | null>(null);

export const ProductFiltersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(
    productFilterReducer,
    DEFAULT_PRODUCT_FILTER_STATE
  );

  return (
    <ProductFiltersContext.Provider value={{ state, dispatch }}>
      {children}
    </ProductFiltersContext.Provider>
  );
};

export function useProductFilters() {
  const context = useContext(ProductFiltersContext);
  if (!context) {
    throw new Error('useProductFilters must be used within ProductFiltersProvider');
  }
  return context;
}



