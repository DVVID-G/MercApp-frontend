export type SortField = 'date' | 'amount' | 'items';

export interface DateRange {
  start: string | null; // ISO date string
  end: string | null;   // ISO date string
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
  page: number;
  pageSize: number;
}

export const DEFAULT_FILTER_STATE: FilterState = {
  dateRange: { start: null, end: null, preset: null },
  sort: { field: 'date', direction: 'desc' },
  search: '',
  priceRange: { min: null, max: null },
  page: 1,
  pageSize: 20,
};

export const FILTERS_STORAGE_KEY = 'purchaseFilters_v1';
