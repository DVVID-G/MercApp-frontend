import { useMemo } from 'react';
import { CatalogProduct } from '../services/product.service';
import { ProductFilterState } from '../types/productFilters';

export function useFilteredProducts(
  products: CatalogProduct[],
  filters: ProductFilterState
): CatalogProduct[] {
  return useMemo(() => {
    return products.filter(product => {
      // Date filter (AND)
      const productDate = new Date(product.createdAt);
      const matchesDate = 
        (!filters.dateRange.start || productDate >= filters.dateRange.start) &&
        (!filters.dateRange.end || productDate <= filters.dateRange.end);
      
      // Price filter (AND)
      const matchesPrice = 
        (!filters.priceRange.min || product.price >= filters.priceRange.min) &&
        (!filters.priceRange.max || product.price <= filters.priceRange.max);
      
      // Category filter (OR logic - show products from ANY selected category)
      const matchesCategory = 
        filters.categories.length === 0 || 
        filters.categories.includes(product.categoria);
      
      // All filters must match (AND logic across filter types)
      return matchesDate && matchesPrice && matchesCategory;
    });
  }, [products, filters]);
}


