import React from 'react';
import { X, Calendar, DollarSign, Tag, Tags } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FilterSummaryTag } from '../../types/productFilters';

interface ProductFilterSummaryProps {
  tags: FilterSummaryTag[];
  totalResults: number;
  totalProducts: number;
  onClearAll: () => void;
  isLoading?: boolean;
}

const iconMap = {
  Calendar,
  DollarSign,
  Tag,
  Tags,
};

export const ProductFilterSummary: React.FC<ProductFilterSummaryProps> = ({
  tags,
  totalResults,
  totalProducts,
  onClearAll,
  isLoading = false
}) => {
  if (tags.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="px-6 py-3 bg-gray-950 border-b-2 border-gray-800"
        role="region"
        aria-label="Filtros activos"
      >
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3" role="list">
          {tags.map((tag, index) => {
            const IconComponent = tag.icon ? iconMap[tag.icon as keyof typeof iconMap] : null;
            return (
              <motion.div
                key={index}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-900 border-2 border-gray-800 rounded-[8px] text-sm text-gray-400"
                role="listitem"
              >
                {IconComponent && (
                  <IconComponent className="w-4 h-4 text-secondary-gold" />
                )}
                <span className="font-medium">{tag.label}</span>
                <button
                  onClick={tag.onRemove}
                  className="ml-1 p-0.5 rounded-full hover:bg-gray-800 text-gray-600 hover:text-error transition-colors"
                  aria-label={`Eliminar filtro ${tag.type}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Results count and clear all */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400" aria-live="polite">
            {isLoading ? (
              <span className="animate-pulse">Cargando...</span>
            ) : (
              <>
                <span className="font-semibold text-white">{totalResults}</span>
                {' '}
                {totalResults === 1 ? 'producto encontrado' : 'productos encontrados'}
                {' '}
                (de {totalProducts})
              </>
            )}
          </p>
          <button
            onClick={onClearAll}
            className="px-4 py-2 rounded-[8px] bg-transparent border-2 border-error/30 text-error text-sm font-medium hover:bg-error/10 hover:border-error transition-colors"
            aria-label="Limpiar todos los filtros"
          >
            Limpiar todo
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};


