import React from 'react';
import { useFilters } from '../../hooks/useFilters';
import { formatISO, startOfToday, subDays, startOfMonth, startOfYear } from 'date-fns';

export const DateRangeSelector: React.FC = () => {
  const { state, dispatch } = useFilters();

  const applyPreset = (key: string) => {
    let start: string | null = null;
    let end: string | null = null;
    const today = startOfToday();
    if (key === 'today') {
      start = formatISO(today, { representation: 'date' });
      end = start;
    } else if (key === 'last7') {
      start = formatISO(subDays(today, 6), { representation: 'date' });
      end = formatISO(today, { representation: 'date' });
    } else if (key === 'last30') {
      start = formatISO(subDays(today, 29), { representation: 'date' });
      end = formatISO(today, { representation: 'date' });
    } else if (key === 'thisMonth') {
      start = formatISO(startOfMonth(today), { representation: 'date' });
      end = formatISO(today, { representation: 'date' });
    }

    dispatch({ type: 'setDateRange', payload: { start, end, preset: key } });
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button onClick={() => applyPreset('today')} className="px-3 py-2 rounded-[8px] bg-gray-950 border border-gray-800 text-sm">Hoy</button>
        <button onClick={() => applyPreset('last7')} className="px-3 py-2 rounded-[8px] bg-gray-950 border border-gray-800 text-sm">Últimos 7 días</button>
        <button onClick={() => applyPreset('last30')} className="px-3 py-2 rounded-[8px] bg-gray-950 border border-gray-800 text-sm">Últimos 30 días</button>
      </div>

      <div className="flex gap-2">
        <label className="flex-1 text-sm">
          Desde
          <input
            type="date"
            className="w-full mt-1 p-2 bg-gray-950 border border-gray-800 rounded-[8px]"
            value={state.dateRange.start ?? ''}
            onChange={(e) => dispatch({ type: 'setDateRange', payload: { ...state.dateRange, start: e.target.value } })}
          />
        </label>
        <label className="flex-1 text-sm">
          Hasta
          <input
            type="date"
            className="w-full mt-1 p-2 bg-gray-950 border border-gray-800 rounded-[8px]"
            value={state.dateRange.end ?? ''}
            onChange={(e) => dispatch({ type: 'setDateRange', payload: { ...state.dateRange, end: e.target.value } })}
          />
        </label>
      </div>
    </div>
  );
};
