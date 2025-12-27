import React, { useState, useRef, useEffect } from 'react';
import { useFilters } from '../../hooks/useFilters';
import { motion, AnimatePresence } from 'motion/react';
import {
  CalendarArrowDown,
  CalendarArrowUp,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  ArrowDown10,
  ArrowUp01,
  ChevronDown,
  Check,
} from 'lucide-react';

interface SortOption {
  field: 'date' | 'amount' | 'items';
  direction: 'asc' | 'desc';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SORT_OPTIONS: SortOption[] = [
  { field: 'date', direction: 'desc', label: 'Fecha (más reciente primero)', icon: CalendarArrowDown },
  { field: 'date', direction: 'asc', label: 'Fecha (más antigua primero)', icon: CalendarArrowUp },
  { field: 'amount', direction: 'desc', label: 'Monto (mayor a menor)', icon: ArrowDownWideNarrow },
  { field: 'amount', direction: 'asc', label: 'Monto (menor a mayor)', icon: ArrowUpNarrowWide },
  { field: 'items', direction: 'desc', label: 'Artículos (más a menos)', icon: ArrowDown10 },
  { field: 'items', direction: 'asc', label: 'Artículos (menos a más)', icon: ArrowUp01 },
];

export const SortSelector: React.FC = () => {
  const { state, dispatch } = useFilters();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Find current sort option index
  useEffect(() => {
    const index = SORT_OPTIONS.findIndex(
      (opt) => opt.field === state.sort.field && opt.direction === state.sort.direction
    );
    if (index >= 0) {
      setSelectedIndex(index);
    }
  }, [state.sort]);

  const currentOption = SORT_OPTIONS[selectedIndex];
  const CurrentIcon = currentOption?.icon || CalendarArrowDown;

  const handleSelect = (option: SortOption) => {
    dispatch({
      type: 'setSort',
      payload: { field: option.field, direction: option.direction },
    });
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % SORT_OPTIONS.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + SORT_OPTIONS.length) % SORT_OPTIONS.length);
        break;
      case 'Home':
        e.preventDefault();
        setSelectedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setSelectedIndex(SORT_OPTIONS.length - 1);
        break;
      case 'Enter':
        e.preventDefault();
        handleSelect(SORT_OPTIONS[selectedIndex]);
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="space-y-2" role="group" aria-labelledby="sort-selector-title">
      <label htmlFor="sort-selector" className="sr-only">
        Ordenar por
      </label>
      <button
        ref={triggerRef}
        id="sort-selector"
        type="button"
        role="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className="w-full px-4 py-3 rounded-[12px] bg-gray-950 border-2 border-gray-800 text-white font-medium text-left flex items-center justify-between gap-2 hover:border-gray-700 focus:outline-none focus:ring-2 focus:ring-secondary-gold focus:border-secondary-gold transition-all duration-200"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <CurrentIcon className="w-5 h-5 text-secondary-gold flex-shrink-0" />
          <span className="truncate text-sm font-medium">{currentOption?.label || 'Ordenar por'}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            role="listbox"
            className="relative z-50 w-full mt-2 bg-gray-950 border-2 border-gray-800 rounded-[12px] shadow-2xl max-h-64 overflow-y-auto"
          >
            {SORT_OPTIONS.map((option, index) => {
              const OptionIcon = option.icon;
              const isSelected = option.field === state.sort.field && option.direction === state.sort.direction;

              return (
                <button
                  key={`${option.field}-${option.direction}`}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelect(option);
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-[8px] transition-all duration-150 ${
                    isSelected
                      ? 'bg-secondary-gold/20 border-2 border-secondary-gold'
                      : 'bg-gray-900 border-2 border-gray-800 hover:bg-gray-800'
                  }`}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                    isSelected
                      ? 'bg-secondary-gold border-secondary-gold'
                      : 'border-gray-700'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 text-gray-950" />}
                  </div>
                  <OptionIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-300 font-medium flex-1 text-left">{option.label}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
