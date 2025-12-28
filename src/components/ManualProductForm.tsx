import { useState, useRef, useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { manualProductSchema, ManualProductFormData } from '../validators/forms';
import { Input } from './Input';
import { Barcode, Scale } from 'lucide-react';

export interface ManualProductFormProps {
  onSubmit: (data: ManualProductFormData & { productType: 'regular' | 'fruver' }) => void;
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
  const scrollTimeoutRef = useRef<number | null>(null);
  const listboxId = useId();

  // Create infinite scroll effect by triplicating options
  const infiniteOptions = [...options, ...options, ...options];
  
  const selectedOption = options.find(opt => opt.value === value);
  const currentValueIndex = options.findIndex(opt => opt.value === value);

  // Momentum-aware infinite scroll with 150ms settle time
  useEffect(() => {
    if (!isOpen || !listRef.current) return;

    const container = listRef.current;

    const handleScroll = () => {
      // Clear any existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Wait 150ms after scroll stops before repositioning
      scrollTimeoutRef.current = window.setTimeout(() => {
        
        // Use requestAnimationFrame for smooth repositioning
        requestAnimationFrame(() => {
          if (!container) return;
          
          const scrollTop = container.scrollTop;
          const scrollHeight = container.scrollHeight;
          const sectionHeight = scrollHeight / 3;
          
          // Reposition if we're in the first or last section (with 30% buffer for smooth experience)
          // First section: 0 to sectionHeight (trigger at 30% = 0.3 * sectionHeight)
          // Middle section: sectionHeight to 2*sectionHeight (safe zone, no repositioning)
          // Last section: 2*sectionHeight to 3*sectionHeight (trigger at 70% = 2.7 * sectionHeight)
          
          if (scrollTop < sectionHeight * 0.3) {
            // In top section - jump down to equivalent position in middle section
            container.scrollTop = scrollTop + sectionHeight;
          } else if (scrollTop > sectionHeight * 2.7) {
            // In bottom section - jump up to equivalent position in middle section
            container.scrollTop = scrollTop - sectionHeight;
          }
        });
      }, 150);
    };

    // Add passive listener for better performance
    container.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initialize scroll position to middle section on open
    requestAnimationFrame(() => {
      if (container) {
        const sectionHeight = container.scrollHeight / 3;
        // Position at start of middle section
        container.scrollTop = sectionHeight;
      }
    });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [isOpen]);

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

  // Focus management: focus on middle section option when dropdown opens
  useEffect(() => {
    if (isOpen && selectedIndex >= 0) {
      // Calculate middle section index
      const middleIndex = options.length + selectedIndex;
      // Focus without scrolling - infinite scroll handles positioning
      requestAnimationFrame(() => {
        if (optionRefs.current[middleIndex]) {
          optionRefs.current[middleIndex]?.focus({ preventScroll: true });
        }
      });
    }
  }, [isOpen, selectedIndex, options.length]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSelectedIndex(-1);
  }

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
          // Always scroll to middle section version
          const middleIndex = options.length + nextIndex;
          if (listRef.current && optionRefs.current[middleIndex]) {
            optionRefs.current[middleIndex]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
          }
          return nextIndex;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex((prev) => {
          const nextIndex = prev > 0 ? prev - 1 : options.length - 1;
          // Always scroll to middle section version
          const middleIndex = options.length + nextIndex;
          if (listRef.current && optionRefs.current[middleIndex]) {
            optionRefs.current[middleIndex]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
          }
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
        // Scroll to middle section version of first item
        if (listRef.current && optionRefs.current[options.length]) {
          optionRefs.current[options.length]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
        break;
      case 'End': {
        e.preventDefault();
        e.stopPropagation();
        const lastIndex = options.length - 1;
        setSelectedIndex(lastIndex);
        // Scroll to middle section version of last item
        const middleLastIndex = options.length + lastIndex;
        if (listRef.current && optionRefs.current[middleLastIndex]) {
          optionRefs.current[middleLastIndex]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
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
            className="absolute z-50 w-full mt-2 rounded-[12px] shadow-2xl"
            style={{ pointerEvents: 'auto' }}
          >
            {/* Top fade indicator */}
            <div 
              className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-gray-950 to-transparent pointer-events-none z-10 rounded-t-[12px]"
              aria-hidden="true"
            />
            
            <div
              ref={listRef}
              role="listbox"
              id={listboxId}
              aria-label="Lista de opciones con scroll infinito"
              className="bg-gray-950 border-2 border-gray-800 rounded-[12px] relative"
              style={{
                maxHeight: '240px',
                height: 'auto',
                overflowY: 'scroll',
                overflowX: 'hidden',
                WebkitOverflowScrolling: 'touch',
                touchAction: 'pan-y',
                overscrollBehavior: 'contain',
                cursor: 'default',
                scrollBehavior: 'auto',
                scrollPaddingTop: '48px',
                scrollPaddingBottom: '48px',
                contain: 'layout style paint',
                willChange: isOpen ? 'scroll-position' : 'auto',
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
              }}
              onWheel={(e) => {
                e.stopPropagation();
              }}
            >
              {infiniteOptions.map((option, infiniteIndex) => {
                // Calculate section: 0=top, 1=middle, 2=bottom
                const sectionIndex = Math.floor(infiniteIndex / options.length);
                const localIndex = infiniteIndex % options.length;
                const isSelected = option.value === value;
                const isFocused = selectedIndex === localIndex;
                
                // Only middle section is fully accessible
                const isMiddleSection = sectionIndex === 1;
                const shouldBeHidden = !isMiddleSection;
                
                return (
                  <button
                    key={`${option.value}-${infiniteIndex}`}
                    ref={(el) => {
                      optionRefs.current[infiniteIndex] = el;
                    }}
                    type="button"
                    role="option"
                    aria-selected={isSelected && isMiddleSection}
                    aria-hidden={shouldBeHidden}
                    aria-setsize={options.length}
                    aria-posinset={localIndex + 1}
                    tabIndex={isFocused && isMiddleSection ? 0 : -1}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(option.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || 
                          e.key === 'Home' || e.key === 'End' || 
                          e.key === 'Enter' || e.key === 'Escape') {
                        handleListKeyDown(e);
                      }
                    }}
                    style={{
                      touchAction: 'manipulation',
                      contain: 'layout style paint',
                    }}
                    className={`
                      w-full px-4 py-3 text-left font-medium text-white
                      transition-all duration-150 ease-in-out
                      ${isFocused && isMiddleSection
                        ? isSelected
                          ? 'bg-secondary-gold bg-opacity-20 border-l-4 border-secondary-gold'
                          : 'bg-secondary-gold bg-opacity-10 border-l-2 border-secondary-gold'
                        : isSelected && isMiddleSection
                          ? 'bg-gray-950 hover:bg-gray-800'
                          : 'bg-gray-950 hover:bg-gray-800'
                      }
                      ${isFocused && isMiddleSection
                        ? 'ring-2 ring-secondary-gold ring-offset-1 ring-offset-gray-950' 
                        : ''
                      }
                      ${infiniteIndex % options.length !== 0 ? 'border-t border-gray-800' : ''}
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
            
            {/* Bottom fade indicator */}
            <div 
              className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-950 to-transparent pointer-events-none z-10 rounded-b-[12px]"
              aria-hidden="true"
            />
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
  // Estado para el tipo de producto
  const [productType, setProductType] = useState<'regular' | 'fruver'>('regular');
  
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

  const handleFormSubmit = (data: ManualProductFormData) => {
    // Agregar el tipo de producto a los datos
    onSubmit({ ...data, productType });
  };

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

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
        {/* SELECTOR DE TIPO DE PRODUCTO */}
        <div className="mb-6">
          <label className="text-gray-400 text-sm mb-3 block">
            Tipo de Producto <span className="text-secondary-gold">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {/* Opción Regular */}
            <button
              type="button"
              onClick={() => setProductType('regular')}
              disabled={isLoading}
              className={`
                relative flex flex-col items-center justify-center gap-2 p-4 rounded-[12px] border-2 transition-all
                ${productType === 'regular' 
                  ? 'border-secondary-gold bg-secondary-gold/10 text-white' 
                  : 'border-gray-800 bg-gray-950 text-gray-400 hover:border-gray-700'
                }
                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {productType === 'regular' && (
                <motion.div
                  layoutId="product-type-indicator"
                  className="absolute inset-0 border-2 border-secondary-gold rounded-[12px]"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Barcode className="w-6 h-6" />
              <span className="text-sm font-semibold">Regular</span>
              <span className="text-xs opacity-70">Con código</span>
            </button>

            {/* Opción Fruver */}
            <button
              type="button"
              onClick={() => setProductType('fruver')}
              disabled={isLoading}
              className={`
                relative flex flex-col items-center justify-center gap-2 p-4 rounded-[12px] border-2 transition-all
                ${productType === 'fruver' 
                  ? 'border-secondary-gold bg-secondary-gold/10 text-white' 
                  : 'border-gray-800 bg-gray-950 text-gray-400 hover:border-gray-700'
                }
                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {productType === 'fruver' && (
                <motion.div
                  layoutId="product-type-indicator"
                  className="absolute inset-0 border-2 border-secondary-gold rounded-[12px]"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Scale className="w-6 h-6" />
              <span className="text-sm font-semibold">Fruver</span>
              <span className="text-xs opacity-70">Peso variable</span>
            </button>
          </div>
        </div>

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
          {/* Price / Precio de Referencia */}
          <Input
            label={productType === 'fruver' ? 'Precio de Referencia *' : 'Precio *'}
            type="number"
            step="0.01"
            placeholder="0.00"
            error={errors.price?.message}
            disabled={isLoading}
            {...register('price', { valueAsNumber: true })}
          />

          {/* Package Size / Peso de Referencia */}
          <Input
            label={productType === 'fruver' ? 'Peso de Referencia (g) *' : 'Tamaño del Paquete *'}
            type="number"
            step="0.01"
            placeholder={productType === 'fruver' ? 'Gramos' : '1.0'}
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

        {/* Barcode - Opcional para Fruver, requerido para Regular */}
        <Input
          label={productType === 'fruver' ? 'Código de Barras (Opcional)' : 'Código de Barras *'}
          placeholder={productType === 'fruver' ? 'Opcional para fruver' : 'Ej: 7790001234567'}
          error={errors.barcode?.message}
          disabled={isLoading}
          {...register('barcode', { 
            required: productType === 'regular' ? 'El código de barras es obligatorio' : false,
            minLength: productType === 'regular' 
              ? { value: 8, message: 'El código de barras debe tener al menos 8 caracteres' }
              : undefined,
            validate: (value) => {
              if (productType === 'regular') {
                if (!value || value.trim().length === 0) {
                  return 'El código de barras es obligatorio para productos regulares';
                }
                if (value.length < 8) {
                  return 'El código de barras debe tener al menos 8 caracteres';
                }
                if (value.length > 20) {
                  return 'El código de barras no puede tener más de 20 caracteres';
                }
              }
              // Para fruver, si se proporciona, debe tener al menos 8 caracteres
              if (productType === 'fruver' && value && value.trim().length > 0) {
                if (value.length < 8) {
                  return 'El código de barras debe tener al menos 8 caracteres';
                }
                if (value.length > 20) {
                  return 'El código de barras no puede tener más de 20 caracteres';
                }
              }
              return true;
            }
          })}
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
              productType === 'fruver' ? '✅ Crear Producto Fruver' : '✅ Crear Producto'
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

export default ManualProductForm;
