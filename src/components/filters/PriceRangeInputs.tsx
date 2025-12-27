import React, { useState } from 'react';
import { X, DollarSign } from 'lucide-react';
import { ProductFilterState } from '../../types/productFilters';
import { motion, AnimatePresence } from 'motion/react';

interface PriceRangeInputsProps {
  priceRange: ProductFilterState['priceRange'];
  onPriceRangeChange: (priceRange: ProductFilterState['priceRange']) => void;
}

export const PriceRangeInputs: React.FC<PriceRangeInputsProps> = ({
  priceRange,
  onPriceRangeChange
}) => {
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: 'min' | 'max', value: string) => {
    const numValue = value === '' ? null : Number(value);
    
    // Validation
    if (numValue !== null && numValue < 0) {
      setError(`El precio ${field === 'min' ? 'mínimo' : 'máximo'} no puede ser negativo`);
      return;
    }

    const newPriceRange = {
      ...priceRange,
      [field]: numValue,
    };

    // Validate min <= max
    if (newPriceRange.min !== null && newPriceRange.max !== null && newPriceRange.min > newPriceRange.max) {
      setError('El precio mínimo debe ser menor al máximo');
    } else {
      setError(null);
    }

    onPriceRangeChange(newPriceRange);
  };

  const handleClear = () => {
    onPriceRangeChange({ min: null, max: null });
    setError(null);
  };

  const hasPriceRange = priceRange.min !== null || priceRange.max !== null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-medium text-gray-400">Rango de precio</label>
        {hasPriceRange && (
          <button
            onClick={handleClear}
            aria-label="Limpiar rango de precio"
            className="text-xs text-gray-500 hover:text-white flex items-center gap-1.5 transition-colors"
            type="button"
          >
            <X className="w-3.5 h-3.5" />
            <span>Limpiar</span>
          </button>
        )}
      </div>
      <div className="flex gap-3 items-start">
        <div className="flex-1">
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 pointer-events-none z-10" />
            <input
              type="number"
              min="0"
              step="0.01"
              value={priceRange.min ?? ''}
              onChange={(e) => handleChange('min', e.target.value)}
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
              value={priceRange.max ?? ''}
              onChange={(e) => handleChange('max', e.target.value)}
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
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-xs text-error mt-1" 
            role="alert" 
            aria-live="polite"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
      {hasPriceRange && (
        <button
          type="button"
          onClick={handleClear}
          className="text-xs text-gray-400 hover:text-white transition-colors"
          aria-label="Limpiar rango de precio"
        >
          Limpiar
        </button>
      )}
    </div>
  );
};


