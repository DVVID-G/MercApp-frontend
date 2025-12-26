import { useState, useRef, useEffect } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
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
            className="absolute z-50 w-full mt-2 bg-gray-950 border-2 border-gray-800 rounded-[12px] shadow-2xl max-h-60 overflow-hidden"
          >
            <div 
              className="overflow-y-auto max-h-60 scrollbar-thin"
              style={{
                WebkitOverflowScrolling: 'touch',
                touchAction: 'pan-y',
                overscrollBehavior: 'contain'
              }}
            >
              {options.map((option, index) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`
                    w-full px-4 py-3 text-left font-medium text-white
                    transition-all duration-150 ease-in-out
                    ${option.value === value 
                      ? 'bg-secondary-gold bg-opacity-20 border-l-4 border-secondary-gold' 
                      : 'bg-gray-950 hover:bg-gray-800'
                    }
                    ${index !== 0 ? 'border-t border-gray-800' : ''}
                    hover:pl-5
                  `}
                >
                  <span className="block text-base">{option.label}</span>
                </button>
              ))}
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
