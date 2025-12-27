import React, { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { es } from 'date-fns/locale';
import { useFilters } from '../../hooks/useFilters';
import { DATE_PRESETS } from '../../utils/filterPresets';
import { formatISO, parseISO, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, X } from 'lucide-react';
import 'react-day-picker/dist/style.css';

export const DateRangeSelector: React.FC = () => {
  const { state, dispatch } = useFilters();
  const [showCustomCalendar, setShowCustomCalendar] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: state.dateRange.start ? parseISO(state.dateRange.start) : undefined,
    to: state.dateRange.end ? parseISO(state.dateRange.end) : undefined,
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  const applyPreset = (presetKey: string) => {
    const preset = DATE_PRESETS.find(p => p.key === presetKey);
    if (preset) {
      const range = preset.getRange();
      const startISO = formatISO(range.start, { representation: 'date' });
      const endISO = formatISO(range.end, { representation: 'date' });
      dispatch({
        type: 'setDateRange',
        payload: {
          start: startISO,
          end: endISO,
          preset: presetKey,
        },
      });
      setDateRange({ from: range.start, to: range.end });
      setShowCustomCalendar(false);
      setValidationError(null);
    }
  };

  const handleCustomDateChange = (range: { from: Date | undefined; to: Date | undefined } | undefined) => {
    if (!range) {
      setDateRange({ from: undefined, to: undefined });
      return;
    }

    setDateRange(range);

    if (range.from && range.to) {
      // Validate: start must be <= end
      if (isAfter(range.from, range.to)) {
        setValidationError('La fecha de inicio debe ser anterior a la fecha final');
        return;
      }

      // Validate: no future dates
      const today = endOfDay(new Date());
      if (isAfter(range.from, today) || isAfter(range.to, today)) {
        setValidationError('No se pueden seleccionar fechas futuras');
        return;
      }

      setValidationError(null);
      dispatch({
        type: 'setDateRange',
        payload: {
          start: formatISO(startOfDay(range.from), { representation: 'date' }),
          end: formatISO(endOfDay(range.to), { representation: 'date' }),
          preset: 'custom',
        },
      });
    } else if (range.from) {
      // Only start date selected, wait for end date
      setValidationError(null);
    }
  };

  const clearDateFilter = () => {
    dispatch({
      type: 'setDateRange',
      payload: { start: null, end: null, preset: null },
    });
    setDateRange({ from: undefined, to: undefined });
    setShowCustomCalendar(false);
    setValidationError(null);
  };

  const hasActiveFilter = state.dateRange.start || state.dateRange.end;

  return (
    <div className="space-y-4">
      {/* Quick Presets */}
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-400 mb-3">Filtros rápidos</label>
        <div 
          className="flex flex-wrap gap-2 pb-2" 
        >
          {DATE_PRESETS.map((preset) => {
            const isActive = state.dateRange.preset === preset.key;
            
            return (
              <button
                key={preset.key}
                type="button"
                role="button"
                aria-pressed={isActive}
                aria-label={`Filtro de fecha: ${preset.label}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  applyPreset(preset.key);
                }}
                className={`px-4 py-3 rounded-[12px] border-2 text-sm font-medium whitespace-nowrap transition-all duration-200 select-none ${
                  isActive
                    ? 'bg-secondary-gold/20 border-secondary-gold text-secondary-gold shadow-lg shadow-secondary-gold/20'
                    : 'bg-gray-950 border-2 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-white'
                }`}
                style={{ minHeight: '44px' }}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Date Range */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-400">Rango personalizado</label>
          {hasActiveFilter && (
            <button
              onClick={clearDateFilter}
              aria-label="Limpiar filtro de fecha"
              className="text-xs text-gray-500 hover:text-white flex items-center gap-1.5 transition-colors"
              type="button"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpiar</span>
            </button>
          )}
        </div>

        <button
          onClick={() => setShowCustomCalendar(!showCustomCalendar)}
          aria-label={showCustomCalendar ? "Ocultar calendario" : "Mostrar calendario de fechas"}
          aria-expanded={showCustomCalendar}
          type="button"
          className="w-full px-4 py-3 rounded-[12px] bg-gray-950 border-2 border-gray-800 text-left flex items-center gap-3 hover:border-gray-700 focus:outline-none focus:ring-2 focus:ring-secondary-gold focus:border-secondary-gold transition-all duration-200"
          style={{ minHeight: '48px' }}
        >
          <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <span className="text-sm font-medium text-gray-300 flex-1 text-left">
            {state.dateRange.start && state.dateRange.end
              ? `${parseISO(state.dateRange.start).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })} - ${parseISO(state.dateRange.end).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`
              : 'Seleccionar fechas'}
          </span>
        </button>

        <AnimatePresence>
          {showCustomCalendar && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="mt-4 p-4 bg-gray-950 border-2 border-gray-800 rounded-[12px] shadow-2xl"
            >
              <style>{`
                .rdp {
                  --rdp-cell-size: 40px;
                  --rdp-accent-color: #d4af37;
                  --rdp-background-color: #1a1a1a;
                  --rdp-accent-color-dark: #d4af37;
                  --rdp-background-color-dark: #1a1a1a;
                  --rdp-outline: 2px solid var(--rdp-accent-color);
                  --rdp-outline-selected: 2px solid var(--rdp-accent-color);
                  margin: 0;
                }
                .rdp-month {
                  margin: 0;
                }
                .rdp-caption {
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  padding: 0.5rem 0;
                  margin-bottom: 0.5rem;
                }
                .rdp-caption_label {
                  font-size: 0.875rem;
                  font-weight: 600;
                  color: #ffffff;
                  text-transform: capitalize;
                }
                .rdp-nav {
                  display: flex;
                  gap: 0.5rem;
                }
                .rdp-button {
                  width: 2rem;
                  height: 2rem;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  border-radius: 0.5rem;
                  border: 2px solid #333333;
                  background-color: #1a1a1a;
                  color: #ffffff;
                  transition: all 0.2s;
                }
                .rdp-button:hover {
                  background-color: #1f1f1f;
                  border-color: #4d4d4d;
                }
                .rdp-button:focus {
                  outline: none;
                  border-color: #d4af37;
                  box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.2);
                }
                .rdp-day {
                  width: var(--rdp-cell-size);
                  height: var(--rdp-cell-size);
                  border-radius: 0.5rem;
                  border: 2px solid transparent;
                  background-color: transparent;
                  color: #ffffff;
                  font-size: 0.875rem;
                  font-weight: 500;
                  transition: all 0.2s;
                }
                .rdp-day:hover {
                  background-color: #1f1f1f;
                  border-color: #4d4d4d;
                }
                .rdp-day_selected {
                  background-color: #d4af37;
                  color: #0d0d0d;
                  border-color: #d4af37;
                  font-weight: 600;
                }
                .rdp-day_selected:hover {
                  background-color: #d4af37;
                  color: #0d0d0d;
                }
                .rdp-day_range_start,
                .rdp-day_range_end {
                  background-color: #d4af37;
                  color: #0d0d0d;
                  border-color: #d4af37;
                  font-weight: 600;
                }
                .rdp-day_range_middle {
                  background-color: rgba(212, 175, 55, 0.1);
                  color: #ffffff;
                  border-color: transparent;
                }
                .rdp-day_today {
                  background-color: #333333;
                  color: #ffffff;
                  border-color: #4d4d4d;
                  font-weight: 600;
                }
                .rdp-day_outside {
                  color: #666666;
                  opacity: 0.5;
                }
                .rdp-day_disabled {
                  color: #666666;
                  opacity: 0.3;
                  cursor: not-allowed;
                }
                .rdp-day_disabled:hover {
                  background-color: transparent;
                  border-color: transparent;
                }
                .rdp-head_cell {
                  color: #b3b3b3;
                  font-size: 0.75rem;
                  font-weight: 600;
                  text-transform: uppercase;
                  padding: 0.5rem 0;
                }
              `}</style>
              <DayPicker
                mode="range"
                selected={dateRange}
                onSelect={handleCustomDateChange}
                locale={es}
                disabled={{ after: new Date() }}
                showOutsideDays={false}
                fixedWeeks
                aria-label="Selector de rango de fechas personalizado"
                classNames={{
                  months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                  month: 'space-y-4',
                  caption: 'flex justify-between pt-1 relative items-center',
                  caption_label: 'text-sm font-semibold text-white',
                  nav: 'space-x-1 flex items-center',
                  nav_button: 'h-8 w-8 bg-gray-950 border-2 border-gray-800 rounded-lg p-0 opacity-70 hover:opacity-100 hover:border-gray-700 text-white transition-all',
                  nav_button_previous: 'absolute left-0',
                  nav_button_next: 'absolute right-0',
                  table: 'w-full border-collapse space-y-1',
                  head_row: 'flex',
                  head_cell: 'text-gray-400 rounded-md w-10 font-semibold text-xs uppercase tracking-wider',
                  row: 'flex w-full mt-2',
                  cell: 'h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-lg [&:has([aria-selected].day-outside)]:bg-gray-900/50 [&:has([aria-selected])]:bg-secondary-gold/20 first:[&:has([aria-selected])]:rounded-l-lg last:[&:has([aria-selected])]:rounded-r-lg focus-within:relative focus-within:z-20',
                  day: 'h-10 w-10 p-0 font-medium aria-selected:opacity-100 text-white hover:bg-gray-900 hover:border-gray-700 rounded-lg border-2 border-transparent transition-all',
                  day_range_end: 'day-range-end',
                  day_selected: 'bg-secondary-gold text-primary-black hover:bg-secondary-gold hover:text-primary-black focus:bg-secondary-gold focus:text-primary-black border-secondary-gold font-semibold',
                  day_today: 'bg-gray-800 text-white border-gray-700 font-semibold',
                  day_outside: 'day-outside text-gray-600 opacity-50 aria-selected:bg-gray-900/50 aria-selected:text-gray-600 aria-selected:opacity-30',
                  day_disabled: 'text-gray-600 opacity-30 cursor-not-allowed',
                  day_range_middle: 'aria-selected:bg-secondary-gold/10 aria-selected:text-white',
                  day_hidden: 'invisible',
                }}
              />
              {validationError && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 text-sm text-error font-medium"
                  role="alert"
                >
                  {validationError}
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
