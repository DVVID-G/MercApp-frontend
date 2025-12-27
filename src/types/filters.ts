export type SortField = 'date' | 'amount' | 'items';

export interface DateRange {
  start: string | null; // ISO date string (for serialization)
  end: string | null;   // ISO date string (for serialization)
  preset: string | null;
}

export interface PriceRange {
  min: number | null;
  max: number | null;
}

export interface FilterState {
  dateRange: DateRange;
  sort: { field: SortField; direction: 'asc' | 'desc' };
  search: string;
  priceRange: PriceRange;
  brands: string[];
  categories: string[];
  page: number;
  pageSize: number;
}

export interface PaginationState {
  /** Current page (1-indexed) */
  currentPage: number;
  
  /** Items displayed per page */
  pageSize: number;
  
  /** Total matching items (after filters) */
  totalItems: number;
  
  /** Total items currently loaded */
  loadedItems: number;
  
  /** Whether more items can be loaded */
  hasMore: boolean;
  
  /** Loading state */
  isLoading: boolean;
}

export interface FilterSummaryTag {
  /** Unique identifier */
  id: string;
  
  /** Category label (e.g., "Fecha", "Precio", "Búsqueda") */
  category: string;
  
  /** Filter value display text */
  value: string;
  
  /** Icon name from lucide-react */
  icon: string;
  
  /** Callback to remove this specific filter */
  onRemove: () => void;
}

export interface DatePreset {
  /** Unique identifier */
  key: string;
  
  /** Display label (Spanish) */
  label: string;
  
  /** Function to calculate date range */
  getRange: () => { start: Date; end: Date };
  
  /** Icon name from lucide-react (optional) */
  icon?: string;
}

export const DEFAULT_FILTER_STATE: FilterState = {
  dateRange: { start: null, end: null, preset: null },
  sort: { field: 'date', direction: 'desc' },
  search: '',
  priceRange: { min: null, max: null },
  brands: [],
  categories: [],
  page: 1,
  pageSize: 20,
};

export const FILTERS_STORAGE_KEY = 'mercapp_purchase_filters_v1';
