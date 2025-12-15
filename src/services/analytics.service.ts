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

export interface AnalyticsOverview {
  range: { from: string; to: string };
  monthly: MonthlyStat[];
  categories: CategoryStat[];
}

export async function getAnalyticsOverview(filters?: { from?: string; to?: string }): Promise<AnalyticsOverview> {
  const params = new URLSearchParams();
  if (filters?.from) params.append('from', filters.from);
  if (filters?.to) params.append('to', filters.to);

  const res = await api.get(`/analytics?${params.toString()}`);
  return res.data.data;
}
