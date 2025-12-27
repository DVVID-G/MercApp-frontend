import { FilterState } from '../types/filters';
import { formatISO, parseISO } from 'date-fns';
import { DATE_PRESETS } from './filterPresets';

export const FILTERS_STORAGE_KEY = 'mercapp_purchase_filters_v1';

interface StoredFilterState {
  dateRange: {
    start: string | null; // ISO 8601 format
    end: string | null;
    preset: string | null;
  };
  sort: {
    field: string;
    direction: string;
  };
  search: string;
  priceRange: {
    min: number | null;
    max: number | null;
  };
  brands: string[];
  categories: string[];
  // Note: page is NOT persisted (always starts at 1)
  _version: number; // Schema version for migration
  _timestamp: string; // Last save timestamp
}

/**
 * Serialize FilterState to JSON string for localStorage
 */
export const serializeFilters = (filters: FilterState): string => {
  const stored: StoredFilterState = {
    dateRange: {
      start: filters.dateRange.start, // Already ISO string
      end: filters.dateRange.end, // Already ISO string
      preset: filters.dateRange.preset,
    },
    sort: filters.sort,
    search: filters.search,
    priceRange: filters.priceRange,
    brands: filters.brands,
    categories: filters.categories,
    _version: 1,
    _timestamp: new Date().toISOString(),
  };
  return JSON.stringify(stored);
};

/**
 * Deserialize JSON string from localStorage to Partial<FilterState>
 */
export const deserializeFilters = (json: string): Partial<FilterState> | null => {
  try {
    const stored: StoredFilterState = JSON.parse(json);

    // Version check for future migrations
    if (stored._version !== 1) {
      console.warn('Unknown filter storage version:', stored._version);
      return null;
    }

    return {
      dateRange: {
        start: stored.dateRange.start,
        end: stored.dateRange.end,
        preset: stored.dateRange.preset,
      },
      sort: stored.sort as FilterState['sort'],
      search: stored.search,
      priceRange: stored.priceRange,
      brands: stored.brands || [],
      categories: stored.categories || [],
      page: 1, // Always reset to page 1
      pageSize: 20, // Default page size
    };
  } catch (error) {
    console.error('Failed to deserialize filters:', error);
    return null;
  }
};

/**
 * Parse URL query parameters to Partial<FilterState>
 */
export const parseURLParams = (searchParams: URLSearchParams): Partial<FilterState> => {
  const filters: Partial<FilterState> = {};

  // Date filter
  const datePreset = searchParams.get('datePreset');
  const dateStart = searchParams.get('dateStart');
  const dateEnd = searchParams.get('dateEnd');

  if (datePreset) {
    const preset = DATE_PRESETS.find((p) => p.key === datePreset);
    if (preset) {
      const range = preset.getRange();
      filters.dateRange = {
        start: formatISO(range.start, { representation: 'date' }),
        end: formatISO(range.end, { representation: 'date' }),
        preset: datePreset,
      };
    }
  } else if (dateStart && dateEnd) {
    filters.dateRange = {
      start: dateStart,
      end: dateEnd,
      preset: 'custom',
    };
  }

  // Sort
  const sortParam = searchParams.get('sort');
  if (sortParam) {
    const [field, direction] = sortParam.split('-');
    if (['date', 'amount', 'items'].includes(field) && ['asc', 'desc'].includes(direction)) {
      filters.sort = {
        field: field as FilterState['sort']['field'],
        direction: direction as FilterState['sort']['direction'],
      };
    }
  }

  // Search
  const search = searchParams.get('search');
  if (search) {
    filters.search = decodeURIComponent(search);
  }

  // Price range
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  if (minPrice || maxPrice) {
    filters.priceRange = {
      min: minPrice ? parseFloat(minPrice) : null,
      max: maxPrice ? parseFloat(maxPrice) : null,
    };
  }

  return filters;
};

/**
 * Serialize FilterState to URL query string
 */
export const serializeToURL = (filters: FilterState): string => {
  const params = new URLSearchParams();

  // Date filter
  if (filters.dateRange.preset) {
    params.set('datePreset', filters.dateRange.preset);
  } else if (filters.dateRange.start && filters.dateRange.end) {
    params.set('dateStart', filters.dateRange.start);
    params.set('dateEnd', filters.dateRange.end);
  }

  // Sort
  params.set('sort', `${filters.sort.field}-${filters.sort.direction}`);

  // Search
  if (filters.search && filters.search.trim().length > 0) {
    params.set('search', encodeURIComponent(filters.search));
  }

  // Price range
  if (filters.priceRange.min !== null) {
    params.set('minPrice', filters.priceRange.min.toString());
  }
  if (filters.priceRange.max !== null) {
    params.set('maxPrice', filters.priceRange.max.toString());
  }

  return params.toString();
};

/**
 * Migrate stored filters from older versions
 */
export const migrateStoredFilters = (stored: any): StoredFilterState | null => {
  try {
    switch (stored._version) {
      case undefined: // v0 (no version)
        return {
          ...stored,
          _version: 1,
          _timestamp: new Date().toISOString(),
        };

      case 1:
        return stored; // Current version

      default:
        console.warn(`Unknown filter storage version: ${stored._version}`);
        return null;
    }
  } catch (error) {
    console.error('Failed to migrate stored filters:', error);
    return null;
  }
};


