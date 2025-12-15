import { api } from './api';

export interface MonthlyStat {
  month: string;
  total: number;
  itemsCount: number;
}

export interface CategoryStat {
  category: string;
  total: number;
  itemsCount: number;
}

export interface DayOfWeekStat {
  day: string;
  total: number;
}

export interface BrandStat {
  brand: string;
  total: number;
}

export interface AnalyticsOverview {
  range: { from: string; to: string };
  monthly: MonthlyStat[];
  categories: CategoryStat[];
  spendingByDayOfWeek: DayOfWeekStat[];
  monthlyComparison: {
    currentMonthTotal: number;
    previousMonthTotal: number;
    percentageChange: number;
  };
  purchaseFrequency: number;
  spendingProjection: number;
  brandDistribution: BrandStat[];
}

export async function getAnalyticsOverview(filters?: { from?: string; to?: string }): Promise<AnalyticsOverview> {
  const params = new URLSearchParams();
  if (filters?.from) params.append('from', filters.from);
  if (filters?.to) params.append('to', filters.to);

  const res = await api.get(`/analytics?${params.toString()}`);
  return res.data.data;
}
