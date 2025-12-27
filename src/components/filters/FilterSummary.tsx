import React from 'react';
import { useFilters } from '../../hooks/useFilters';
import { DATE_PRESETS } from '../../utils/filterPresets';
import { parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Search, DollarSign, X, Filter, Tag, Folder } from 'lucide-react';
import { FilterSummaryTag } from '../../types/filters';

export const FilterSummary: React.FC = () => {
  const { state, dispatch } = useFilters();

  const generateFilterTags = (): FilterSummaryTag[] => {
    const tags: FilterSummaryTag[] = [];

    // Date range tag
    if (state.dateRange.preset) {
      const preset = DATE_PRESETS.find((p) => p.key === state.dateRange.preset);
      tags.push({
        id: 'date-range',
        category: 'Fecha',
        value: preset?.label || 'Personalizado',
        icon: 'Calendar',
        onRemove: () => dispatch({ type: 'setDateRange', payload: { start: null, end: null, preset: null } }),
      });
    } else if (state.dateRange.start && state.dateRange.end) {
      tags.push({
        id: 'date-range',
        category: 'Fecha',
        value: 'Personalizado',
        icon: 'Calendar',
        onRemove: () => dispatch({ type: 'setDateRange', payload: { start: null, end: null, preset: null } }),
      });
    }

    // Search tag
    if (state.search && state.search.trim().length > 0) {
      tags.push({
        id: 'search',
        category: 'Búsqueda',
        value: `"${state.search}"`,
        icon: 'Search',
        onRemove: () => dispatch({ type: 'setSearch', payload: '' }),
      });
    }

    // Price range tag
    if (state.priceRange.min !== null || state.priceRange.max !== null) {
      const min = state.priceRange.min ?? 0;
      const max = state.priceRange.max ?? '∞';
      tags.push({
        id: 'price-range',
        category: 'Precio',
        value: `$${min} - $${max}`,
        icon: 'DollarSign',
        onRemove: () => dispatch({ type: 'setPriceRange', payload: { min: null, max: null } }),
      });
    }

    // Brand tags
    state.brands.forEach((brand) => {
      tags.push({
        id: `brand-${brand}`,
        category: 'Marca',
        value: brand,
        icon: 'Tag',
        onRemove: () => dispatch({ type: 'setBrands', payload: state.brands.filter((b) => b !== brand) }),
      });
    });

    // Category tags
    state.categories.forEach((category) => {
      tags.push({
        id: `category-${category}`,
        category: 'Categoría',
        value: category,
        icon: 'Folder',
        onRemove: () => dispatch({ type: 'setCategories', payload: state.categories.filter((c) => c !== category) }),
      });
    });

    return tags;
  };

  const tags = generateFilterTags();
  const hasActiveFilters = tags.length > 0;

  const clearAllFilters = () => {
    dispatch({ type: 'reset' });
  };

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="flex flex-wrap items-center gap-2 mb-4"
      >
        {tags.map((tag) => {
          const IconComponent = getIconComponent(tag.icon);
          return (
            <motion.button
              key={tag.id}
              onClick={tag.onRemove}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-[8px] text-sm text-white flex items-center gap-2 hover:bg-gray-800 hover:border-gray-700 transition-colors"
              aria-label={`Eliminar filtro ${tag.category}: ${tag.value}`}
            >
              <IconComponent className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-gray-300">{tag.category}:</span>
              <span className="text-white font-medium">{tag.value}</span>
              <X className="w-3.5 h-3.5 text-gray-500 hover:text-white transition-colors" />
            </motion.button>
          );
        })}
        {tags.length > 1 && (
          <button
            onClick={clearAllFilters}
            className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
            aria-label="Limpiar todos los filtros"
          >
            <X className="w-4 h-4" />
            Limpiar todo
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

function getIconComponent(iconName: string) {
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    Calendar,
    Search,
    DollarSign,
    Filter,
    Tag,
    Folder,
  };
  return icons[iconName] || Filter;
}
