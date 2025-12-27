import React, { useMemo, useState, useEffect } from 'react';
import { useFilters } from '../../hooks/useFilters';
import { Check, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { listProducts } from '../../services/product.service';

export const BrandFilter: React.FC = () => {
  const { state, dispatch } = useFilters();
  const [isExpanded, setIsExpanded] = useState(false);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const selectedCount = state.brands.length;

  // Fetch unique brands from database
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setIsLoading(true);
        const products = await listProducts();
        const brandsSet = new Set<string>();
        products.forEach((product) => {
          if (product.marca && product.marca.trim().length > 0) {
            brandsSet.add(product.marca.trim());
          }
        });
        const sortedBrands = Array.from(brandsSet).sort((a, b) => a.localeCompare(b));
        setAvailableBrands(sortedBrands);
      } catch (error) {
        console.error('Error fetching brands:', error);
        setAvailableBrands([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrands();
  }, []);

  const handleToggleBrand = (brand: string) => {
    const isSelected = state.brands.includes(brand);
    if (isSelected) {
      dispatch({ type: 'setBrands', payload: state.brands.filter((b) => b !== brand) });
    } else {
      dispatch({ type: 'setBrands', payload: [...state.brands, brand] });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2" role="group" aria-labelledby="brand-filter-title">
        <h3 id="brand-filter-title" className="text-sm font-medium text-white mb-3">
          Marca
        </h3>
        <p className="text-sm text-gray-400">Cargando marcas...</p>
      </div>
    );
  }

  if (availableBrands.length === 0) {
    return (
      <div className="space-y-2" role="group" aria-labelledby="brand-filter-title">
        <h3 id="brand-filter-title" className="text-sm font-medium text-white mb-3">
          Marca
        </h3>
        <p className="text-sm text-gray-400">No hay marcas disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-2" role="group" aria-labelledby="brand-filter-title">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-3"
        aria-expanded={isExpanded}
        aria-controls="brand-filter-list"
        id="brand-filter-title"
      >
        <h3 className="text-sm font-medium text-white">
          Marca
          {selectedCount > 0 && (
            <span className="ml-2 text-xs text-secondary-gold">
              ({selectedCount} {selectedCount === 1 ? 'seleccionada' : 'seleccionadas'})
            </span>
          )}
        </h3>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isExpanded ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            id="brand-filter-list"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-1 max-h-[200px] overflow-y-auto">
              {availableBrands.map((brand) => {
                const isSelected = state.brands.includes(brand);
                return (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => handleToggleBrand(brand)}
                    role="checkbox"
                    aria-checked={isSelected}
                    aria-label={`Filtrar por marca ${brand}`}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-[12px] transition-colors ${
                      isSelected
                        ? 'bg-secondary-gold/20 border-2 border-secondary-gold'
                        : 'bg-gray-950 border-2 border-gray-800 hover:bg-gray-800'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-secondary-gold border-secondary-gold' : 'border-gray-700'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-gray-950" />}
                    </div>
                    <span className="text-sm text-gray-300 font-medium">{brand}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

