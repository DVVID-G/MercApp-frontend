import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '../Button';
import { QuantitySelector } from './QuantitySelector';
import type { CatalogProduct } from '../../types/product';
import { isProductRegular, isProductFruver } from '../../types/product';

export interface AddToCartCardProps {
  product: CatalogProduct;
  onAddToCart: (quantity: number) => void;
  onCancel: () => void;
  isOpen: boolean;
}

/**
 * Bottom drawer card que permite al usuario seleccionar cantidad
 * antes de agregar un producto a la compra.
 */
export function AddToCartCard({
  product,
  onAddToCart,
  onCancel,
  isOpen,
}: AddToCartCardProps) {
  const [quantity, setQuantity] = useState(1);
  
  // Get price based on product type
  const unitPrice = isProductFruver(product) && product.pum
    ? product.pum // PUM is price per gram for fruver
    : isProductRegular(product)
    ? product.price
    : 0;
  
  // Calculate total
  const total = unitPrice * quantity;

  // Reset quantity cuando el modal se abre
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
    }
  }, [isOpen]);

  // Manejar tecla Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onCancel]);

  const handleAdd = () => {
    onAddToCart(quantity);
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/60 z-50"
            aria-hidden="true"
          />

          {/* Bottom Sheet Card */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ 
              type: 'spring', 
              damping: 25, 
              stiffness: 300 
            }}
            className="fixed bottom-0 left-0 right-0 max-w-[390px] mx-auto
                       bg-gray-950 border-t-2 border-gray-800 rounded-t-[24px] p-6
                       z-50 max-h-[90vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-to-cart-title"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div className="w-12 h-1 bg-gray-800 rounded-full mx-auto mb-6" />

            {/* Título */}
            <h3
              id="add-to-cart-title"
              className="text-xl font-bold text-white mb-6"
            >
              Añadir a la compra
            </h3>

            {/* Información del Producto */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-white mb-1">
                {product.name}
              </h4>
              <p className="text-sm text-gray-400 mb-3">
                {product.marca}
              </p>
              
              <div className="flex items-baseline gap-2 mb-4">
                {isProductFruver(product) && product.pum ? (
                  <>
                    <span className="text-2xl font-bold text-secondary-gold">
                      ${product.pum.toFixed(2)}/g
                    </span>
                    {product.referencePrice && (
                      <span className="text-xs text-gray-500">
                        (Referencia: ${product.referencePrice.toFixed(2)})
                      </span>
                    )}
                  </>
                ) : isProductRegular(product) ? (
                  <>
                    <span className="text-2xl font-bold text-secondary-gold">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.pum && (
                      <span className="text-xs text-gray-500">
                        ${product.pum.toFixed(2)}/{product.umd}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-2xl font-bold text-secondary-gold">
                    $0.00
                  </span>
                )}
              </div>

              {/* Separador */}
              <div className="border-t border-gray-800 my-4" />
            </div>

            {/* Selector de Cantidad */}
            <div className="mb-6">
              <QuantitySelector
                value={quantity}
                onChange={setQuantity}
                productType={product.productType}
                min={1}
                max={9999}
              />
            </div>

            {/* Total */}
            <div className="mb-6 p-4 bg-gradient-to-r from-secondary-gold/5 to-secondary-gold/10 
                          border-2 border-secondary-gold/20 rounded-[12px]">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Total</span>
                <span className="text-3xl font-bold text-secondary-gold">
                  ${total.toFixed(2)}
                </span>
              </div>
              {isProductFruver(product) && product.pum && (
                <p className="text-xs text-gray-500 mt-2">
                  ${product.pum.toFixed(2)}/g × {quantity}g = ${total.toFixed(2)}
                </p>
              )}
            </div>

            {/* Botones de Acción */}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={onCancel}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleAdd}
                icon={ShoppingCart}
                className="flex-1"
              >
                Añadir
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

