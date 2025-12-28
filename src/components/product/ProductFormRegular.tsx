import { useForm } from 'react-hook-form';
import { Package, Tag, Grid3x3, DollarSign, Box } from 'lucide-react';
import { Input } from '../Input';
import { CreateProductRegularRequest } from '../../types/product';

export interface ProductFormRegularProps {
  onSubmit: (data: CreateProductRegularRequest) => void;
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
  { value: 'kg', label: 'Kilogramos (kg)' },
  { value: 'g', label: 'Gramos (g)' },
  { value: 'litros', label: 'Litros (L)' },
  { value: 'ml', label: 'Mililitros (ml)' },
  { value: 'unidad', label: 'Unidad' },
];

export function ProductFormRegular({ onSubmit, onCancel, isLoading = false }: ProductFormRegularProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateProductRegularRequest>({
    defaultValues: {
      productType: 'regular',
      categoria: 'Otros',
      umd: 'unidad',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Nombre del Producto */}
      <Input
        label="Nombre del Producto"
        icon={Package}
        placeholder="Ej: Limpiavidrios, Jabón..."
        required
        error={errors.name?.message}
        {...register('name', { required: 'El nombre es obligatorio' })}
      />

      {/* Marca */}
      <Input
        label="Marca"
        icon={Tag}
        placeholder="Ej: Mr. Músculo, Ace..."
        required
        error={errors.marca?.message}
        {...register('marca', { required: 'La marca es obligatoria' })}
      />

      {/* Código de Barras */}
      <Input
        label="Código de Barras"
        icon={Grid3x3}
        placeholder="Ej: 7790011000123"
        required
        error={errors.barcode?.message}
        {...register('barcode', {
          required: 'El código de barras es obligatorio',
          minLength: { value: 8, message: 'Mínimo 8 caracteres' },
        })}
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

      {/* Precio y Tamaño del Paquete */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Precio"
          icon={DollarSign}
          type="number"
          placeholder="8000"
          required
          error={errors.price?.message}
          {...register('price', {
            required: 'El precio es obligatorio',
            valueAsNumber: true,
            min: { value: 1, message: 'El precio debe ser mayor a 0' },
          })}
        />

        <Input
          label="Tamaño del Paquete"
          icon={Box}
          type="number"
          placeholder="500"
          required
          error={errors.packageSize?.message}
          {...register('packageSize', {
            required: 'El tamaño del paquete es obligatorio',
            valueAsNumber: true,
            min: { value: 1, message: 'El tamaño debe ser mayor a 0' },
          })}
        />
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
          {isLoading ? 'Creando...' : 'Crear Producto'}
        </button>
      </div>
    </form>
  );
}

