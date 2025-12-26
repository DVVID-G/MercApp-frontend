import { useState, useRef, useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { manualProductSchema, ManualProductFormData } from '../validators/forms';
import { Input } from './Input';

export interface ManualProductFormProps {
  onSubmit: (data: ManualProductFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<ManualProductFormData>;
}

const UMD_OPTIONS = [
  { value: 'kg', label: 'Kilogramos (kg)' },
  { value: 'gramos', label: 'Gramos (g)' },
  { value: 'litros', label: 'Litros (L)' },
  { value: 'ml', label: 'Mililitros (ml)' },
  { value: 'unidad', label: 'Unidad' },
];

const CATEGORIA_OPTIONS = [
  { value: 'Fruver', label: '🥬 Fruver' },
  { value: 'Lácteos', label: '🥛 Lácteos' },
  { value: 'Granos', label: '🌾 Granos' },
  { value: 'Carnes', label: '🥩 Carnes' },
  { value: 'Panadería', label: '🥖 Panadería' },
  { value: 'Bebidas', label: '🥤 Bebidas' },
  { value: 'Aseo', label: '🧼 Aseo' },
  { value: 'Higiene', label: '🧴 Higiene' },
  { value: 'Snacks', label: '🍿 Snacks' },
  { value: 'Condimentos', label: '🧂 Condimentos' },
  { value: 'Otros', label: '📦 Otros' },
];

// Custom Select Component
interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
  placeholder?: string;
  error?: string;
}

function CustomSelect({ value, onChange, options, disabled = false, placeholder, error }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const listboxId = useId();
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const selectedOption = options.find(opt => opt.value === value);
  const currentValueIndex = options.findIndex(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Reset selectedIndex when dropdown opens/closes
  useEffect(() => {
    if (isOpen) {
      // Set initial focus to current value or first option
      setSelectedIndex(currentValueIndex >= 0 ? currentValueIndex : 0);
    } else {
      setSelectedIndex(-1);
    }
  }, [isOpen, currentValueIndex]);

  // Scroll to selected option when navigating with keyboard
  useEffect(() => {
    if (isOpen && selectedIndex >= 0 && listRef.current && optionRefs.current[selectedIndex]) {
      const selectedElement = optionRefs.current[selectedIndex];
      if (selectedElement) {
        const listElement = listRef.current;
        const elementTop = selectedElement.offsetTop;
        const elementBottom = elementTop + selectedElement.offsetHeight;
        const listTop = listElement.scrollTop;
        const listBottom = listTop + listElement.offsetHeight;

        if (elementTop < listTop) {
          listElement.scrollTo({ top: elementTop, behavior: 'smooth' });
        } else if (elementBottom > listBottom) {
          listElement.scrollTo({ top: elementBottom - listElement.offsetHeight, behavior: 'smooth' });
        }
      }
    }
  }, [selectedIndex, isOpen]);

  // Focus management: focus on selected option when dropdown opens
  useEffect(() => {
    if (isOpen && selectedIndex >= 0 && optionRefs.current[selectedIndex]) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        optionRefs.current[selectedIndex]?.focus();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, selectedIndex]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const scrollToOption = (index: number) => {
    if (listRef.current && optionRefs.current[index]) {
      const element = optionRefs.current[index];
      if (element) {
        element.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  };

  const handleTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setSelectedIndex(currentValueIndex >= 0 ? currentValueIndex : 0);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setSelectedIndex(currentValueIndex >= 0 ? currentValueIndex : options.length - 1);
        }
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setSelectedIndex(currentValueIndex >= 0 ? currentValueIndex : 0);
        }
        break;
      case 'Escape':
        if (isOpen) {
          e.preventDefault();
          setIsOpen(false);
          setSelectedIndex(-1);
        }
        break;
    }
  };

  const handleListKeyDown = (e: React.KeyboardEvent<HTMLDivElement | HTMLButtonElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex((prev) => {
          const nextIndex = prev < options.length - 1 ? prev + 1 : 0;
          scrollToOption(nextIndex);
          return nextIndex;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex((prev) => {
          const nextIndex = prev > 0 ? prev - 1 : options.length - 1;
          scrollToOption(nextIndex);
          return nextIndex;
        });
        break;
      case 'Enter':
        e.preventDefault();
        e.stopPropagation();
        if (selectedIndex >= 0 && selectedIndex < options.length) {
          handleSelect(options[selectedIndex].value);
        }
        break;
      case 'Escape':
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
      case 'Home':
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex(0);
        scrollToOption(0);
        break;
      case 'End': {
        e.preventDefault();
        e.stopPropagation();
        const lastIndex = options.length - 1;
        setSelectedIndex(lastIndex);
        scrollToOption(lastIndex);
        break;
      }
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleTriggerKeyDown}
        disabled={disabled}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-label={placeholder || 'Seleccionar opción'}
        className={`w-full px-4 py-2.5 bg-gray-950 text-white border-2 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-secondary-gold focus:border-secondary-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left flex items-center justify-between ${
          error ? 'border-error' : 'border-gray-800 hover:border-gray-700'
        }`}
      >
        <span className="block truncate">
          {selectedOption?.label || placeholder || 'Seleccionar...'}
        </span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute z-50 w-full mt-2 bg-gray-950 border-2 border-gray-800 rounded-[12px] shadow-2xl overflow-hidden"
          >
            <div
              ref={listRef}
              role="listbox"
              id={listboxId}
              className="overflow-y-auto max-h-60 scrollbar-thin"
              style={{
                WebkitOverflowScrolling: 'touch',
                touchAction: 'pan-y',
                overscrollBehavior: 'contain',
                maxHeight: '240px'
              }}
            >
              {options.map((option, index) => {
                const isSelected = option.value === value;
                const isFocused = selectedIndex === index;
                
                return (
                  <button
                    key={option.value}
                    ref={(el) => {
                      optionRefs.current[index] = el;
                    }}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    tabIndex={isFocused ? 0 : -1}
                    onClick={() => {
                      handleSelect(option.value);
                    }}
                    onTouchStart={(e) => {
                      // Store touch start position to detect scroll vs tap
                      if (e.touches.length === 1) {
                        const touch = e.touches[0];
                        touchStartRef.current = {
                          x: touch.clientX,
                          y: touch.clientY,
                          time: Date.now()
                        };
                      }
                    }}
                    onTouchMove={(e) => {
                      // Don't prevent default - allow scroll to work naturally
                      // Just track movement to distinguish tap from scroll
                      if (touchStartRef.current && e.touches.length === 1) {
                        const touch = e.touches[0];
                        const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
                        
                        // If vertical movement > 10px, mark as scroll (don't trigger click)
                        if (deltaY > 10) {
                          touchStartRef.current = null; // Mark as scroll, cancel tap
                        }
                      }
                    }}
                    onTouchEnd={(e) => {
                      // Only trigger click if it was a tap (not a scroll)
                      if (touchStartRef.current) {
                        const deltaX = Math.abs(e.changedTouches[0].clientX - touchStartRef.current.x);
                        const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartRef.current.y);
                        const deltaTime = Date.now() - touchStartRef.current.time;
                        
                        // If movement was small and quick, it's a tap
                        if (deltaX < 10 && deltaY < 10 && deltaTime < 300) {
                          e.preventDefault();
                          handleSelect(option.value);
                        }
                        touchStartRef.current = null;
                      }
                    }}
                    onKeyDown={(e) => {
                      // Handle keyboard navigation on individual buttons
                      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || 
                          e.key === 'Home' || e.key === 'End' || 
                          e.key === 'Enter' || e.key === 'Escape') {
                        handleListKeyDown(e);
                      }
                    }}
                    className={`
                      w-full px-4 py-3 text-left font-medium text-white
                      transition-all duration-150 ease-in-out
                      ${isFocused 
                        ? isSelected
                          ? 'bg-secondary-gold bg-opacity-20 border-l-4 border-secondary-gold'
                          : 'bg-secondary-gold bg-opacity-10 border-l-2 border-secondary-gold'
                        : isSelected
                          ? 'bg-gray-950 hover:bg-gray-800'
                          : 'bg-gray-950 hover:bg-gray-800'
                      }
                      ${isFocused 
                        ? 'ring-2 ring-secondary-gold ring-offset-1 ring-offset-gray-950' 
                        : ''
                      }
                      ${index !== 0 ? 'border-t border-gray-800' : ''}
                      hover:pl-5
                      focus:outline-none focus:ring-2 focus:ring-secondary-gold
                    `}
                  >
                    <span className="block text-base">
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  );
}

export function ManualProductForm({
  onSubmit,
  onCancel,
  isLoading = false,
  initialData = {},
}: ManualProductFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<ManualProductFormData>({
    resolver: zodResolver(manualProductSchema),
    defaultValues: {
      name: initialData.name || '',
      marca: initialData.marca || '',
      price: initialData.price || 0,
      packageSize: initialData.packageSize || 0,
      umd: initialData.umd || 'unidad',
      barcode: initialData.barcode || '',
      categoria: initialData.categoria || 'Otros',
    },
  });

  const price = watch('price');
  const packageSize = watch('packageSize');
  const umd = watch('umd');

  const calculatedPUM = price > 0 && packageSize > 0
    ? (price / packageSize).toFixed(2)
    : '0.00';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-950 border-2 border-gray-800 rounded-[16px] shadow-xl p-6"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <span className="text-3xl">➡️</span>
          <span>Crear Producto Manualmente</span>
        </h2>
        <p className="text-sm text-gray-400">
          Completa todos los campos para agregar un nuevo producto al catálogo
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Name */}
        <Input
          label="Nombre del Producto *"
          placeholder="Ej: Leche Entera"
          error={errors.name?.message}
          disabled={isLoading}
          {...register('name')}
        />

        {/* Marca */}
        <Input
          label="Marca *"
          placeholder="Ej: Alpina"
          error={errors.marca?.message}
          disabled={isLoading}
          {...register('marca')}
        />

        {/* Price and Package Size Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Price */}
          <Input
            label="Precio *"
            type="number"
            step="0.01"
            placeholder="0.00"
            error={errors.price?.message}
            disabled={isLoading}
            {...register('price', { valueAsNumber: true })}
          />

          {/* Package Size */}
          <Input
            label="Tamaño del Paquete *"
            type="number"
            step="0.01"
            placeholder="1.0"
            error={errors.packageSize?.message}
            disabled={isLoading}
            {...register('packageSize', { valueAsNumber: true })}
          />
        </div>

        {/* UMD */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Unidad de Medida *
          </label>
          <Controller
            name="umd"
            control={control}
            render={({ field }) => (
              <CustomSelect
                value={field.value}
                onChange={field.onChange}
                options={UMD_OPTIONS}
                disabled={isLoading}
                placeholder="Selecciona unidad"
                error={errors.umd?.message}
              />
            )}
          />
        </div>

        {/* PUM Display */}
        {price > 0 && packageSize > 0 && (
          <div className="bg-gradient-to-r from-gray-900 to-gray-950 p-3 rounded-[8px] border-2 border-gray-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                📊 PUM (Precio por {umd})
              </span>
              <span className="text-lg font-bold text-secondary-gold">
                ${calculatedPUM}
              </span>
            </div>
          </div>
        )}

        {/* Barcode */}
        <Input
          label="Código de Barras *"
          placeholder="Ej: 7790001234567"
          error={errors.barcode?.message}
          disabled={isLoading}
          {...register('barcode')}
        />

        {/* Categoria */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Categoría *
          </label>
          <Controller
            name="categoria"
            control={control}
            render={({ field }) => (
              <CustomSelect
                value={field.value}
                onChange={field.onChange}
                options={CATEGORIA_OPTIONS}
                disabled={isLoading}
                placeholder="Selecciona una categoría"
                error={errors.categoria?.message}
              />
            )}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-gray-950 border-2 border-gray-800 text-white rounded-[12px] font-medium hover:border-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-primary-black border-2 border-secondary-gold text-white rounded-[12px] font-medium hover:bg-secondary-gold hover:text-primary-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Guardando...
              </span>
            ) : (
              'Crear Producto'
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

export default ManualProductForm;
