import { useMemo } from 'react';
import { Purchase } from '../App';
import { useFilters } from './useFilters';
import { parseISO, isAfter, isBefore } from 'date-fns';

export function useFilteredPurchases(purchases: Purchase[]) {
  const { state, dispatch } = useFilters();

  const filteredSorted = useMemo(() => {
    const { dateRange, search, priceRange, sort } = state;

    let list = purchases.slice();

    // Date range filter
    if (dateRange.start || dateRange.end) {
      const start = dateRange.start ? parseISO(dateRange.start) : null;
      const end = dateRange.end ? parseISO(dateRange.end) : null;
      list = list.filter((p) => {
        const d = parseISO(p.date);
        if (start && isBefore(d, start)) return false;
        if (end && isAfter(d, end)) return false;
        return true;
      });
    }

    // Search by product name
    if (search && search.trim().length > 0) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.products.some((pr) => pr.name.toLowerCase().includes(q)));
    }

    // Price range
    if (priceRange.min != null) {
      list = list.filter((p) => p.total >= (priceRange.min ?? 0));
    }
    if (priceRange.max != null) {
      list = list.filter((p) => p.total <= (priceRange.max ?? Infinity));
    }

    // Sort
    if (sort.field === 'date') {
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (sort.field === 'amount') {
      list.sort((a, b) => b.total - a.total);
    } else if (sort.field === 'items') {
      list.sort((a, b) => b.itemCount - a.itemCount);
    }

    if (sort.direction === 'asc') list.reverse();

    return list;
  }, [purchases, state]);

  const total = filteredSorted.length;
  const paged = useMemo(() => {
    const end = state.page * state.pageSize;
    return filteredSorted.slice(0, end);
  }, [filteredSorted, state.page, state.pageSize]);

  const hasMore = paged.length < total;

  const loadMore = () => dispatch({ type: 'setPage', payload: state.page + 1 });
  const resetPage = () => dispatch({ type: 'setPage', payload: 1 });

  return { filtered: paged, total, hasMore, loadMore, resetPage };
}
