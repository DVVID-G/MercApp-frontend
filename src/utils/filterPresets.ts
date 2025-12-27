import {
  startOfDay,
  endOfDay,
  subDays,
  startOfMonth,
  endOfMonth,
  subMonths,
} from 'date-fns';

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

export const DATE_PRESETS: DatePreset[] = [
  {
    key: 'today',
    label: 'Hoy',
    icon: 'Calendar',
    getRange: () => ({
      start: startOfDay(new Date()),
      end: endOfDay(new Date()),
    }),
  },
  {
    key: 'last7Days',
    label: 'Últimos 7 días',
    icon: 'CalendarDays',
    getRange: () => ({
      start: subDays(startOfDay(new Date()), 6), // Include today
      end: endOfDay(new Date()),
    }),
  },
  {
    key: 'last30Days',
    label: 'Últimos 30 días',
    icon: 'CalendarRange',
    getRange: () => ({
      start: subDays(startOfDay(new Date()), 29), // Include today
      end: endOfDay(new Date()),
    }),
  },
  {
    key: 'thisMonth',
    label: 'Este mes',
    icon: 'CalendarCheck',
    getRange: () => ({
      start: startOfMonth(new Date()),
      end: endOfDay(new Date()),
    }),
  },
  {
    key: 'lastMonth',
    label: 'Mes anterior',
    icon: 'Calendar',
    getRange: () => {
      const lastMonth = subMonths(new Date(), 1);
      return {
        start: startOfMonth(lastMonth),
        end: endOfMonth(lastMonth),
      };
    },
  },
];


