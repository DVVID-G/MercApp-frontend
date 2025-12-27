import React, { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { es } from 'date-fns/locale';
import { DATE_PRESETS } from '../../types/productFilters';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, X } from 'lucide-react';
import 'react-day-picker/dist/style.css';
import { ProductFilterState } from '../../types/productFilters';

interface ProductDateRangeSelectorProps {
  dateRange: ProductFilterState['dateRange'];
  onDateRangeChange: (dateRange: ProductFilterState['dateRange']) => void;
}

export const ProductDateRangeSelector: React.FC<ProductDateRangeSelectorProps> = ({
  dateRange,
  onDateRangeChange
}) => {
  const [showCustomCalendar, setShowCustomCalendar] = useState(false);
  const [customRange, setCustomRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: dateRange.start || undefined,
    to: dateRange.end || undefined,
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  const applyPreset = (presetKey: string) => {
    const preset = DATE_PRESETS.find(p => p.key === presetKey);
    if (preset) {
      const range = preset.getRange();
      onDateRangeChange({
        start: range.start,
        end: range.end,
        preset: presetKey,
      });
      setCustomRange({ from: range.start, to: range.end });
      setShowCustomCalendar(false);
      setValidationError(null);
    }
  };

  const handleCustomDateChange = (range: { from: Date | undefined; to: Date | undefined } | undefined) => {
    if (!range) {
      setCustomRange({ from: undefined, to: undefined });
      return;
    }

    setCustomRange(range);

    if (range.from && range.to) {
      if (range.from > range.to) {
        setValidationError('La fecha de inicio debe ser anterior a la fecha final');
        return;
      }
      setValidationError(null);
      onDateRangeChange({
        start: range.from,
        end: range.to,
        preset: 'custom',
      });
    } else if (range.from) {
      onDateRangeChange({
        start: range.from,
        end: null,
        preset: 'custom',
      });
    }
  };

  const clearDateFilter = () => {
    onDateRangeChange({ start: null, end: null, preset: null });
    setCustomRange({ from: undefined, to: undefined });
    setShowCustomCalendar(false);
    setValidationError(null);
  };

  const hasActiveFilter = dateRange.start || dateRange.end;

  return (
    <div className="space-y-4">
      {/* Quick Presets */}
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-400 mb-3">Filtros rápidos</label>
        <div className="flex flex-wrap gap-2 pb-2">
          {DATE_PRESETS.map((preset) => {
            const isActive = dateRange.preset === preset.key;
            
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
          <Calendar className="w-5 h-5 text-gray-600 flex-shrink-0" />
          <span className="text-white flex-1">
            {dateRange.start && dateRange.end
              ? `${format(dateRange.start, 'dd/MM/yyyy')} - ${format(dateRange.end, 'dd/MM/yyyy')}`
              : dateRange.start
              ? `Desde ${format(dateRange.start, 'dd/MM/yyyy')}`
              : 'Seleccionar rango de fechas'}
          </span>
        </button>

        {/* Custom calendar */}
        <AnimatePresence>
        {showCustomCalendar && (
          <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-3 p-4 bg-gray-950 border-2 border-gray-800 rounded-[12px]"
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
                  justify-content: center;
                  padding: 8px 0;
                  color: #ffffff;
                  font-weight: 500;
                }
                .rdp-nav_button {
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  width: 32px;
                  height: 32px;
                  border-radius: 8px;
                  background-color: transparent;
                  color: #b3b3b3;
                  transition: background-color 0.2s, color 0.2s;
                }
                .rdp-nav_button:hover {
                  background-color: #1f1f1f;
                  color: #ffffff;
                }
                .rdp-head_cell {
                  color: #b3b3b3;
                  font-weight: 500;
                  font-size: 0.875rem;
                }
                .rdp-day {
                  color: #ffffff;
                  border-radius: 8px;
                  transition: background-color 0.2s, color 0.2s;
                }
                .rdp-day_selected {
                  background-color: #d4af37 !important;
                  color: #0d0d0d !important;
                  font-weight: 600;
                }
                .rdp-day_range_middle {
                  background-color: rgba(212, 175, 55, 0.2) !important;
                  color: #ffffff !important;
                }
                .rdp-day_today {
                  background-color: #333333;
                  color: #ffffff;
                }
                .rdp-day_outside, .rdp-day_disabled {
                  color: #666666;
                  opacity: 0.5;
                }
                .rdp-day:hover:not(.rdp-day_selected):not(.rdp-day_disabled) {
                  background-color: #1f1f1f;
                }
              `}</style>
          <DayPicker
            mode="range"
            selected={customRange}
            onSelect={handleCustomDateChange}
            locale={es}
          />
          {validationError && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-xs text-error mt-2" 
              role="alert"
              aria-live="polite"
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


