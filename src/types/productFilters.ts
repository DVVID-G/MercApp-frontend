import {
  startOfDay,
  endOfDay,
  subDays,
  startOfMonth,
  endOfMonth,
  subMonths,
} from 'date-fns';

// Product filter state
export interface ProductFilterState {
  /** Date range filter */
  dateRange: {
    /** Start date (inclusive), null if no date filter */
    start: Date | null;
    /** End date (inclusive), null if no date filter */
    end: Date | null;
    /** Active preset key ('today' | 'last7Days' | 'last30Days' | 'thisMonth' | 'lastMonth' | 'custom'), null if no filter */
    preset: string | null;
  };
  
  /** Price range filter */
  priceRange: {
    /** Minimum price (inclusive), null if no minimum */
    min: number | null;
    /** Maximum price (inclusive), null if no maximum */
    max: number | null;
  };
  
  /** Selected categories (OR logic - show products from ANY selected category) */
  categories: string[];
}

// Date preset configuration (reused from 003)
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

// Filter summary tag
export interface FilterSummaryTag {
  /** Filter type identifier */
  type: 'date' | 'price' | 'category';
  
  /** Display label (e.g., "Fecha: Últimos 7 días") */
  label: string;
  
  /** Callback to remove this specific filter */
  onRemove: () => void;
  
  /** Optional icon name from lucide-react */
  icon?: string;
}

// Product categories
export const CATEGORIES = [
  'Fruver',
  'Lácteos',
  'Granos',
  'Carnes',
  'Panadería',
  'Bebidas',
  'Aseo',
  'Higiene',
  'Snacks',
  'Condimentos',
  'Otros'
] as const;

export type ProductCategory = typeof CATEGORIES[number];

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  'Fruver': '🥬 Fruver',
  'Lácteos': '🥛 Lácteos',
  'Granos': '🌾 Granos',
  'Carnes': '🥩 Carnes',
  'Panadería': '🥖 Panadería',
  'Bebidas': '🥤 Bebidas',
  'Aseo': '🧼 Aseo',
  'Higiene': '🧴 Higiene',
  'Snacks': '🍿 Snacks',
  'Condimentos': '🧂 Condimentos',
  'Otros': '📦 Otros'
};

// Date presets (reused from 003)
export const DATE_PRESETS: DatePreset[] = [
  {
    key: 'today',
    label: 'Hoy',
    icon: 'Calendar',
    getRange: () => ({
      start: startOfDay(new Date()),
      end: endOfDay(new Date())
    })
  },
  {
    key: 'last7Days',
    label: 'Últimos 7 días',
    icon: 'CalendarDays',
    getRange: () => ({
      start: startOfDay(subDays(new Date(), 7)),
      end: endOfDay(new Date())
    })
  },
  {
    key: 'last30Days',
    label: 'Últimos 30 días',
    icon: 'CalendarRange',
    getRange: () => ({
      start: startOfDay(subDays(new Date(), 30)),
      end: endOfDay(new Date())
    })
  },
  {
    key: 'thisMonth',
    label: 'Este mes',
    icon: 'Calendar',
    getRange: () => {
      const now = new Date();
      return {
        start: startOfMonth(now),
        end: endOfDay(now)
      };
    }
  },
  {
    key: 'lastMonth',
    label: 'Mes anterior',
    icon: 'Calendar',
    getRange: () => {
      const now = new Date();
      const lastMonth = subMonths(now, 1);
      return {
        start: startOfMonth(lastMonth),
        end: endOfMonth(lastMonth)
      };
    }
  }
];

// Default filter state
export const DEFAULT_PRODUCT_FILTER_STATE: ProductFilterState = {
  dateRange: { start: null, end: null, preset: null },
  priceRange: { min: null, max: null },
  categories: []
};

// Filter actions
export type ProductFilterAction =
  | { type: 'setDateRange'; payload: ProductFilterState['dateRange'] }
  | { type: 'setPriceRange'; payload: ProductFilterState['priceRange'] }
  | { type: 'setCategories'; payload: string[] }
  | { type: 'toggleCategory'; payload: string }
  | { type: 'clearDateRange' }
  | { type: 'clearPriceRange' }
  | { type: 'clearCategories' }
  | { type: 'reset' };

// Product filter reducer
export function productFilterReducer(
  state: ProductFilterState,
  action: ProductFilterAction
): ProductFilterState {
  switch (action.type) {
    case 'setDateRange':
      return { ...state, dateRange: action.payload };
    case 'setPriceRange':
      return { ...state, priceRange: action.payload };
    case 'setCategories':
      return { ...state, categories: action.payload };
    case 'toggleCategory':
      const category = action.payload;
      const isSelected = state.categories.includes(category);
      return {
        ...state,
        categories: isSelected
          ? state.categories.filter(c => c !== category)
          : [...state.categories, category]
      };
    case 'clearDateRange':
      return { ...state, dateRange: { start: null, end: null, preset: null } };
    case 'clearPriceRange':
      return { ...state, priceRange: { min: null, max: null } };
    case 'clearCategories':
      return { ...state, categories: [] };
    case 'reset':
      return DEFAULT_PRODUCT_FILTER_STATE;
    default:
      return state;
  }
}

// Helper to get active filter count
export function getActiveFilterCount(filters: ProductFilterState): number {
  let count = 0;
  
  if (filters.dateRange.start || filters.dateRange.end || filters.dateRange.preset) {
    count++;
  }
  
  if (filters.priceRange.min !== null || filters.priceRange.max !== null) {
    count++;
  }
  
  if (filters.categories.length > 0) {
    count++;
  }
  
  return count;
}


