import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface ManualProductFormData {
  name: string;
  marca: string;
  price: number;
  packageSize: number;
  umd: string;
  barcode: string;
  categoria: string;
}

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
}

function CustomSelect({ value, onChange, options, disabled = false, placeholder }: CustomSelectProps) {
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
        className="w-full px-4 py-2.5 bg-gray-950 text-white border-2 border-gray-800 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-secondary-gold focus:border-secondary-gold hover:border-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left flex items-center justify-between"
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
            <div className="overflow-y-auto max-h-60 scrollbar-thin">
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
    </div>
  );
}

export function ManualProductForm({
  onSubmit,
  onCancel,
  isLoading = false,
  initialData = {},
}: ManualProductFormProps) {
  const [formData, setFormData] = useState<ManualProductFormData>({
    name: initialData.name || '',
    marca: initialData.marca || '',
    price: initialData.price || 0,
    packageSize: initialData.packageSize || 0,
    umd: initialData.umd || 'unidad',
    barcode: initialData.barcode || '',
    categoria: initialData.categoria || 'Otros',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ManualProductFormData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ManualProductFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }

    if (!formData.marca.trim()) {
      newErrors.marca = 'La marca es obligatoria';
    }

    if (formData.price <= 0) {
      newErrors.price = 'El precio debe ser mayor a 0';
    }

    if (formData.packageSize <= 0) {
      newErrors.packageSize = 'El tamaño del paquete debe ser mayor a 0';
    }

    if (!formData.barcode.trim()) {
      newErrors.barcode = 'El código de barras es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof ManualProductFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const calculatedPUM = formData.price > 0 && formData.packageSize > 0
    ? (formData.price / formData.packageSize).toFixed(2)
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

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-2">
            Nombre del Producto *
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={`w-full px-4 py-2.5 bg-gray-950 text-white border-2 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-secondary-gold focus:border-secondary-gold transition-colors placeholder:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed ${
              errors.name ? 'border-error' : 'border-gray-800'
            }`}
            placeholder="Ej: Leche Entera"
            disabled={isLoading}
          />
          {errors.name && <p className="mt-1 text-sm text-error">{errors.name}</p>}
        </div>

        {/* Marca */}
        <div>
          <label htmlFor="marca" className="block text-sm font-medium text-gray-400 mb-2">
            Marca *
          </label>
          <input
            id="marca"
            type="text"
            value={formData.marca}
            onChange={(e) => handleChange('marca', e.target.value)}
            className={`w-full px-4 py-2.5 bg-gray-950 text-white border-2 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-secondary-gold focus:border-secondary-gold transition-colors placeholder:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed ${
              errors.marca ? 'border-error' : 'border-gray-800'
            }`}
            placeholder="Ej: Alpina"
            disabled={isLoading}
          />
          {errors.marca && <p className="mt-1 text-sm text-error">{errors.marca}</p>}
        </div>

        {/* Price and Package Size Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Price */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-400 mb-2">
              Precio *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium pointer-events-none"></span>
              <input
                id="price"
                type="number"
                step="0.01"
                value={formData.price || ''}
                onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                className={`w-full pl-10 pr-4 py-2.5 bg-gray-950 text-white border-2 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-secondary-gold focus:border-secondary-gold transition-colors placeholder:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.price ? 'border-error' : 'border-gray-800'
                }`}
                placeholder="0.00"
                disabled={isLoading}
              />
            </div>
            {errors.price && <p className="mt-1 text-sm text-error">{errors.price}</p>}
          </div>

          {/* Package Size */}
          <div>
            <label htmlFor="packageSize" className="block text-sm font-medium text-gray-400 mb-2">
              Tamaño del Paquete *
            </label>
            <input
              id="packageSize"
              type="number"
              step="0.01"
              value={formData.packageSize || ''}
              onChange={(e) => handleChange('packageSize', parseFloat(e.target.value) || 0)}
              className={`w-full px-4 py-2.5 bg-gray-950 text-white border-2 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-secondary-gold focus:border-secondary-gold transition-colors placeholder:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.packageSize ? 'border-error' : 'border-gray-800'
              }`}
              placeholder="1.0"
              disabled={isLoading}
            />
            {errors.packageSize && <p className="mt-1 text-sm text-error">{errors.packageSize}</p>}
          </div>
        </div>

        {/* UMD */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Unidad de Medida *
          </label>
          <CustomSelect
            value={formData.umd}
            onChange={(value) => handleChange('umd', value)}
            options={UMD_OPTIONS}
            disabled={isLoading}
            placeholder="Selecciona unidad"
          />
        </div>

        {/* PUM Display */}
        {formData.price > 0 && formData.packageSize > 0 && (
          <div className="bg-gradient-to-r from-gray-900 to-gray-950 p-3 rounded-[8px] border-2 border-gray-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                📊 PUM (Precio por {formData.umd})
              </span>
              <span className="text-lg font-bold text-secondary-gold">
                ${calculatedPUM}
              </span>
            </div>
          </div>
        )}

        {/* Barcode */}
        <div>
          <label htmlFor="barcode" className="block text-sm font-medium text-gray-400 mb-2">
            Código de Barras *
          </label>
          <input
            id="barcode"
            type="text"
            value={formData.barcode}
            onChange={(e) => handleChange('barcode', e.target.value)}
            className={`w-full px-4 py-2.5 bg-gray-950 text-white border-2 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-secondary-gold focus:border-secondary-gold transition-colors placeholder:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed ${
              errors.barcode ? 'border-error' : 'border-gray-800'
            }`}
            placeholder="Ej: 7790001234567"
            disabled={isLoading}
          />
          {errors.barcode && <p className="mt-1 text-sm text-error">{errors.barcode}</p>}
        </div>

        {/* Categoria */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Categoría *
          </label>
          <CustomSelect
            value={formData.categoria}
            onChange={(value) => handleChange('categoria', value)}
            options={CATEGORIA_OPTIONS}
            disabled={isLoading}
            placeholder="Selecciona una categoría"
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
