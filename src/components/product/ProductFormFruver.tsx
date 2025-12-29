import { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Package, Tag, Grid3x3, DollarSign, Weight } from 'lucide-react';
import { Input } from '../Input';
import { CreateProductFruverRequest } from '../../types/product';
import { calculatePUM } from '../../utils/pum-calculator';
import { formatCOP, formatPUM } from '../../utils/currency';

export interface ProductFormFruverProps {
  onSubmit: (data: CreateProductFruverRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

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

const UMD_OPTIONS = [
  { value: 'g', label: 'Gramos (g)' },
  { value: 'kg', label: 'Kilogramos (kg)' },
];

export function ProductFormFruver({ onSubmit, onCancel, isLoading = false }: ProductFormFruverProps) {
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<CreateProductFruverRequest>({
    defaultValues: {
      productType: 'fruver',
      umd: 'g',
      categoria: 'Fruver',
    },
  });

  const referencePrice = watch('referencePrice');
  const referenceWeight = watch('referenceWeight');

  // Calcular PUM en tiempo real para preview
  const pumPreview = useMemo(() => {
    if (referencePrice > 0 && referenceWeight > 0) {
      try {
        const pum = calculatePUM(referencePrice, referenceWeight);
        return formatPUM(pum, 'g');
      } catch {
        return '-';
      }
    }
    return '-';
  }, [referencePrice, referenceWeight]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Nombre del Producto */}
      <Input
        label="Nombre del Producto"
        icon={Package}
        placeholder="Ej: Banano, Manzana, Papa..."
        required
        error={errors.name?.message}
        {...register('name', { required: 'El nombre es obligatorio' })}
      />

      {/* Marca */}
      <Input
        label="Marca"
        icon={Tag}
        placeholder="Ej: Nacional, Importado..."
        required
        error={errors.marca?.message}
        {...register('marca', { required: 'La marca es obligatoria' })}
      />

      {/* Categoría */}
      <div className="flex flex-col gap-2">
        <label className="text-gray-400 text-sm">
          Categoría <span className="text-secondary-gold">*</span>
        </label>
        <select
          className="w-full bg-gray-950 border border-gray-800 rounded-[8px] px-4 py-3 text-white focus:outline-none focus:border-secondary-gold transition-colors"
          {...register('categoria', { required: 'La categoría es obligatoria' })}
        >
          {CATEGORIA_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {errors.categoria && (
          <span className="text-error text-sm">{errors.categoria.message}</span>
        )}
      </div>

      {/* Precio y Peso de Referencia */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Precio de Referencia"
          icon={DollarSign}
          type="number"
          placeholder="2500"
          required
          error={errors.referencePrice?.message}
          {...register('referencePrice', {
            required: 'El precio de referencia es obligatorio',
            valueAsNumber: true,
            min: { value: 1, message: 'El precio debe ser mayor a 0' },
          })}
        />

        <Input
          label="Peso de Referencia (gramos)"
          icon={Weight}
          type="number"
          placeholder="500"
          required
          error={errors.referenceWeight?.message}
          {...register('referenceWeight', {
            required: 'El peso de referencia es obligatorio',
            valueAsNumber: true,
            min: { value: 1, message: 'El peso debe ser mayor a 0' },
          })}
        />
      </div>

      {/* PUM Preview */}
      <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-[12px]">
        <p className="text-gray-400 text-sm mb-2">PUM Calculado (Precio por Gramo)</p>
        <p className="text-3xl font-bold text-secondary-gold">{pumPreview}</p>
        <p className="text-xs text-gray-500 mt-2">
          Este es el precio que se usará para calcular el total según la cantidad que el usuario lleve
        </p>
      </div>

      {/* Unidad de Medida */}
      <div className="flex flex-col gap-2">
        <label className="text-gray-400 text-sm">
          Unidad de Medida <span className="text-secondary-gold">*</span>
        </label>
        <select
          className="w-full bg-gray-950 border border-gray-800 rounded-[8px] px-4 py-3 text-white focus:outline-none focus:border-secondary-gold transition-colors"
          {...register('umd', { required: 'La unidad de medida es obligatoria' })}
        >
          {UMD_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {errors.umd && <span className="text-error text-sm">{errors.umd.message}</span>}
      </div>

      {/* Código de Barras (Opcional) */}
      <Input
        label="Código de Barras (Opcional)"
        icon={Grid3x3}
        placeholder="Opcional para productos fruver"
        error={errors.barcode?.message}
        {...register('barcode')}
      />

      {/* Botones de Acción */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 px-6 py-3 bg-gray-800 text-white rounded-[8px] font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-6 py-3 bg-secondary-gold text-black rounded-[8px] font-semibold hover:bg-secondary-gold/90 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Creando...' : 'Crear Producto Fruver'}
        </button>
      </div>
    </form>
  );
}


