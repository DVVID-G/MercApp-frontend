import React, { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';
import { ProductFiltersProvider, useProductFilters } from '../hooks/useProductFilters';
import { useFilteredProducts } from '../hooks/useFilteredProducts';
import { ProductFilterPanel } from './filters/ProductFilterPanel';
import { ProductFilterSummary } from './filters/ProductFilterSummary';
import { generateFilterTags } from '../utils/productFilterTags';
import { getActiveFilterCount } from '../types/productFilters';
import { listProducts, Product } from '../services/product.service';
import { Card } from './Card';

/**
 * Example component demonstrating product filtering integration
 * This can be integrated into ProductSearchInput or CreatePurchase components
 */
function ProductCatalogInner() {
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { state: filters, dispatch } = useProductFilters();
  const filteredProducts = useFilteredProducts(allProducts, filters);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const products = await listProducts();
        setAllProducts(products);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filterTags = generateFilterTags(filters, dispatch);
  const activeFilterCount = getActiveFilterCount(filters);

  return (
    <div className="min-h-screen pb-24">
      {/* Header with filter button */}
      <div className="bg-gradient-to-b from-gray-950 to-primary-black px-6 pt-12 pb-6 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Catálogo de Productos</h2>
            <small className="text-gray-400">Filtra por fecha, precio y categoría</small>
          </div>
          <button
            onClick={() => setIsFilterPanelOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-[8px] bg-gray-900 border-2 border-gray-800 hover:bg-gray-800 transition-colors"
            aria-label="Abrir filtros"
          >
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-secondary-gold text-gray-950 text-xs font-semibold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filter Summary */}
      <ProductFilterSummary
        tags={filterTags}
        totalResults={filteredProducts.length}
        totalProducts={allProducts.length}
        onClearAll={() => dispatch({ type: 'reset' })}
        isLoading={isLoading}
      />

      {/* Product List */}
      <div className="px-6 py-4">
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-400">Cargando productos...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">No hay productos que coincidan con los filtros seleccionados</p>
            <button
              onClick={() => dispatch({ type: 'reset' })}
              className="px-4 py-2 rounded-[8px] bg-gray-900 border-2 border-gray-800 text-gray-300 hover:bg-gray-800 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProducts.map((product) => (
              <Card key={product._id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-white font-medium mb-1">{product.name}</p>
                    <small className="text-gray-400">{product.categoria}</small>
                    <div className="mt-2">
                      <span className="text-secondary-gold font-semibold">
                        ${product.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Filter Panel */}
      <ProductFilterPanel
        isOpen={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
      />
    </div>
  );
}

export function ProductCatalog() {
  return (
    <ProductFiltersProvider>
      <ProductCatalogInner />
    </ProductFiltersProvider>
  );
}


