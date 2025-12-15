import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface PriceUpdateModalProps {
  isOpen: boolean;
  productName: string;
  catalogPrice: number;
  newPrice: number;
  onUseCatalogPrice: () => void;
  onUpdateCatalog: () => void;
  onUseNewPriceOnce: () => void;
  onClose: () => void;
}

export function PriceUpdateModal({
  isOpen,
  productName,
  catalogPrice,
  newPrice,
  onUseCatalogPrice,
  onUpdateCatalog,
  onUseNewPriceOnce,
  onClose,
}: PriceUpdateModalProps) {
  const priceDiff = newPrice - catalogPrice;
  const percentChange = ((priceDiff / catalogPrice) * 100).toFixed(1);
  const isIncrease = priceDiff > 0;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ 
              type: 'spring',
              damping: 25,
              stiffness: 300
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onKeyDown={handleKeyDown}
            tabIndex={-1}
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-2xl">💰</span>
                  <span className="leading-tight">Precio Diferente Detectado</span>
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full flex-shrink-0"
                  aria-label="Cerrar"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Product Info */}
              <div className="mb-6">
                <div className="text-sm text-gray-600 mb-1">Producto:</div>
                <div className="font-medium text-gray-900">{productName}</div>
              </div>

              {/* Price Comparison */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Precio en Catálogo</div>
                    <div className="text-2xl font-bold text-gray-700">
                      ${catalogPrice.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Precio Nuevo</div>
                    <div className="text-2xl font-bold text-secondary-gold">
                      ${newPrice.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Difference Badge */}
                <div className="mt-3 text-center">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      isIncrease
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {isIncrease ? '↑' : '↓'} {Math.abs(priceDiff).toFixed(2)} ({percentChange}%)
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 sm:space-y-3">
                {/* Option 1: Use Catalog Price */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onUseCatalogPrice}
                  className="w-full px-3 sm:px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Usar Precio del Catálogo</div>
                      <div className="text-sm text-gray-600">
                        Mantener ${catalogPrice.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-2xl">📋</div>
                  </div>
                </motion.button>

                {/* Option 2: Update Catalog */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onUpdateCatalog}
                  className="w-full px-3 sm:px-4 py-3 bg-secondary-gold hover:bg-yellow-600 text-white rounded-lg transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Actualizar Catálogo</div>
                      <div className="text-sm text-yellow-100">
                        Guardar ${newPrice.toFixed(2)} como nuevo precio
                      </div>
                    </div>
                    <div className="text-2xl">💾</div>
                  </div>
                </motion.button>

                {/* Option 3: Use New Price Once */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onUseNewPriceOnce}
                  className="w-full px-3 sm:px-4 py-3 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-lg transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm sm:text-base">Usar Solo Esta Vez</div>
                      <div className="text-xs sm:text-sm text-blue-700">
                        ${newPrice.toFixed(2)} sin actualizar catálogo
                      </div>
                    </div>
                    <div className="text-2xl flex-shrink-0">🔄</div>
                  </div>
                </motion.button>
              </div>

              {/* Info Note */}
              <div className="mt-3 sm:mt-4 text-xs text-gray-500 text-center px-2">
                <span className="inline-flex items-center gap-1">
                  <span>💡</span>
                  <span>Tip: Actualizar el catálogo te ayudará a mantener precios consistentes</span>
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default PriceUpdateModal;
