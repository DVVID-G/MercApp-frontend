import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ProductTypeSelector } from './ProductTypeSelector';
import { ProductFormRegular } from './ProductFormRegular';
import { ProductFormFruver } from './ProductFormFruver';
import { CreateProductRequest } from '../../types/product';
import { createProduct } from '../../services/product.service';
import { toast } from 'sonner';

export interface ProductFormProps {
  onSuccess?: () => void;
  onCancel: () => void;
}

/**
 * Formulario orquestador que permite crear productos regulares o fruver
 * Muestra el formulario apropiado según el tipo seleccionado
 */
export function ProductForm({ onSuccess, onCancel }: ProductFormProps) {
  const [productType, setProductType] = useState<'regular' | 'fruver'>('regular');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: CreateProductRequest) => {
    setIsLoading(true);
    try {
      await createProduct(data);
      toast.success(
        data.productType === 'fruver'
          ? '¡Producto fruver creado exitosamente!'
          : '¡Producto creado exitosamente!'
      );
      onSuccess?.();
    } catch (error: any) {
      console.error('Error creando producto:', error);
      toast.error(
        error.response?.data?.message || 'Error al crear el producto. Intente nuevamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Selector de Tipo de Producto */}
      <ProductTypeSelector
        value={productType}
        onChange={setProductType}
        disabled={isLoading}
      />

      {/* Formulario Condicional con Animación */}
      <AnimatePresence mode="wait">
        {productType === 'regular' ? (
          <motion.div
            key="regular-form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <ProductFormRegular
              onSubmit={handleSubmit}
              onCancel={onCancel}
              isLoading={isLoading}
            />
          </motion.div>
        ) : (
          <motion.div
            key="fruver-form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ProductFormFruver
              onSubmit={handleSubmit}
              onCancel={onCancel}
              isLoading={isLoading}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

