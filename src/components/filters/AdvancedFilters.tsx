import React, { useState } from 'react';
import { useFilters } from '../../hooks/useFilters';
import { useDebounce } from 'use-debounce';
import { Search, DollarSign, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AdvancedFilters: React.FC = () => {
  const { state, dispatch } = useFilters();
  const [localSearch, setLocalSearch] = useState(state.search);
  const [debouncedSearch] = useDebounce(localSearch, 300);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Update filter when debounced search changes
  React.useEffect(() => {
    dispatch({ type: 'setSearch', payload: debouncedSearch });
  }, [debouncedSearch, dispatch]);

  const handlePriceRangeChange = (field: 'min' | 'max', value: string) => {
    const numValue = value === '' ? null : Number(value);
    
    // Validate price range
    if (numValue !== null && numValue < 0) {
      setPriceError(`El precio ${field === 'min' ? 'mínimo' : 'máximo'} no puede ser negativo`);
      return;
    }

    const newPriceRange = {
      ...state.priceRange,
      [field]: numValue,
    };

    // Validate min <= max
    if (newPriceRange.min !== null && newPriceRange.max !== null && newPriceRange.min > newPriceRange.max) {
      setPriceError('El precio mínimo no puede ser mayor que el máximo');
    } else {
      setPriceError(null);
    }

    dispatch({ type: 'setPriceRange', payload: newPriceRange });
  };

  const clearSearch = () => {
    setLocalSearch('');
    dispatch({ type: 'setSearch', payload: '' });
  };

  const clearPriceRange = () => {
    dispatch({ type: 'setPriceRange', payload: { min: null, max: null } });
    setPriceError(null);
  };

  const hasSearch = localSearch.trim().length > 0;
  const hasPriceRange = state.priceRange.min !== null || state.priceRange.max !== null;
  const activeFilterCount = (hasSearch ? 1 : 0) + (hasPriceRange ? 1 : 0);

  return (
    <div className="space-y-2" role="group" aria-labelledby="advanced-filters-title">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-3"
        aria-expanded={isExpanded}
        aria-controls="advanced-filters-content"
        id="advanced-filters-title"
      >
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-white">Filtros avanzados</h3>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 bg-secondary-gold/20 border border-secondary-gold/30 rounded-[4px] text-secondary-gold text-xs font-semibold">
              {activeFilterCount}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isExpanded ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            id="advanced-filters-content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden space-y-4"
          >
            {/* Search Input */}
      <div>
        <label htmlFor="search-input" className="block text-sm font-medium text-gray-400 mb-3">
          Buscar por producto
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none z-10" />
          <input
            id="search-input"
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Buscar por nombre de producto..."
            className="flex-1 w-full pr-12 bg-gray-950 text-white border-2 border-gray-800 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-secondary-gold focus:border-secondary-gold placeholder:text-gray-600 transition-colors"
            style={{ 
              height: '48px',
              lineHeight: '48px',
              paddingTop: '0',
              paddingBottom: '0',
              paddingLeft: '56px',
            }}
            aria-label="Buscar productos"
          />
          {hasSearch && (
            <button
              onClick={clearSearch}
              aria-label="Limpiar búsqueda"
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-3">Rango de precio</label>
        <div className="flex gap-3 items-start">
          <div className="flex-1">
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none z-10" />
              <input
                type="number"
                min="0"
                step="0.01"
                value={state.priceRange.min ?? ''}
                onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                placeholder="Mín"
                className="flex-1 w-full pr-4 bg-gray-950 text-white border-2 border-gray-800 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-secondary-gold focus:border-secondary-gold placeholder:text-gray-600 transition-colors"
                style={{ 
                  height: '48px',
                  lineHeight: '48px',
                  paddingTop: '0',
                  paddingBottom: '0',
                  paddingLeft: '56px',
                }}
                aria-label="Precio mínimo"
              />
            </div>
          </div>
          <span className="text-gray-400 pt-3 text-lg font-medium">-</span>
          <div className="flex-1">
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none z-10" />
              <input
                type="number"
                min="0"
                step="0.01"
                value={state.priceRange.max ?? ''}
                onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                placeholder="Máx"
                className="flex-1 w-full pr-4 bg-gray-950 text-white border-2 border-gray-800 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-secondary-gold focus:border-secondary-gold placeholder:text-gray-600 transition-colors"
                style={{ 
                  height: '48px',
                  lineHeight: '48px',
                  paddingTop: '0',
                  paddingBottom: '0',
                  paddingLeft: '56px',
                }}
                aria-label="Precio máximo"
              />
            </div>
          </div>
          {hasPriceRange && (
            <button
              onClick={clearPriceRange}
              aria-label="Limpiar rango de precio"
              type="button"
              className="pt-3 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <AnimatePresence>
          {priceError && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="mt-2 text-sm text-error font-medium"
              role="alert"
            >
              {priceError}
            </motion.p>
          )}
        </AnimatePresence>
          </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
