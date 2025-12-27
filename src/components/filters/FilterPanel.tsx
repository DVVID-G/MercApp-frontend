import React from 'react';
import { DateRangeSelector } from './DateRangeSelector';
import { SortSelector } from './SortSelector';
import { AdvancedFilters } from './AdvancedFilters';
import { FilterSummary } from './FilterSummary';

export const FilterPanel: React.FC<{ purchases: any[] }> = ({ purchases }) => {
  return (
    <div className="space-y-4">
      <FilterSummary />
      <DateRangeSelector />
      <SortSelector />
      <AdvancedFilters />
    </div>
  );
};
