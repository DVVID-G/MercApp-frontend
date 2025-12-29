import { format } from 'date-fns';
import { FilterSummaryTag, ProductFilterState, DATE_PRESETS } from '../types/productFilters';
import { formatCOP } from './currency';

export function generateFilterTags(
  filters: ProductFilterState,
  dispatch: (action: any) => void
): FilterSummaryTag[] {
  const tags: FilterSummaryTag[] = [];
  
  // Date tag
  if (filters.dateRange.preset) {
    const preset = DATE_PRESETS.find(p => p.key === filters.dateRange.preset);
    tags.push({
      type: 'date',
      label: `Fecha: ${preset?.label || filters.dateRange.preset}`,
      icon: 'Calendar',
      onRemove: () => dispatch({ type: 'clearDateRange' })
    });
  } else if (filters.dateRange.start || filters.dateRange.end) {
    const startStr = filters.dateRange.start 
      ? format(filters.dateRange.start, 'dd/MM/yyyy')
      : '...';
    const endStr = filters.dateRange.end 
      ? format(filters.dateRange.end, 'dd/MM/yyyy')
      : '...';
    tags.push({
      type: 'date',
      label: `Fecha: ${startStr} - ${endStr}`,
      icon: 'Calendar',
      onRemove: () => dispatch({ type: 'clearDateRange' })
    });
  }
  
  // Price tag
  if (filters.priceRange.min !== null || filters.priceRange.max !== null) {
    const minStr = filters.priceRange.min !== null 
      ? formatCOP(filters.priceRange.min)
      : '...';
    const maxStr = filters.priceRange.max !== null 
      ? formatCOP(filters.priceRange.max)
      : '...';
    tags.push({
      type: 'price',
      label: `Precio: ${minStr} - ${maxStr}`,
      icon: 'DollarSign',
      onRemove: () => dispatch({ type: 'clearPriceRange' })
    });
  }
  
  // Category tags
  if (filters.categories.length > 0) {
    if (filters.categories.length === 1) {
      tags.push({
        type: 'category',
        label: `Categoría: ${filters.categories[0]}`,
        icon: 'Tag',
        onRemove: () => dispatch({ type: 'toggleCategory', payload: filters.categories[0] })
      });
    } else {
      tags.push({
        type: 'category',
        label: `Categorías: ${filters.categories.length} seleccionadas`,
        icon: 'Tags',
        onRemove: () => dispatch({ type: 'clearCategories' })
      });
    }
  }
  
  return tags;
}



