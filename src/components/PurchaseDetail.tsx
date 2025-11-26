import { ArrowLeft, Calendar, Package, DollarSign, Tag } from 'lucide-react';
import { Card } from './Card';
import { Purchase } from '../App';
import { motion } from 'motion/react';

interface PurchaseDetailProps {
  purchase: Purchase | null;
  onBack: () => void;
}

export function PurchaseDetail({ purchase, onBack }: PurchaseDetailProps) {
  if (!purchase) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <p className="text-gray-400">No se encontró la compra</p>
      </div>
    );
  }

  const categoryTotals = purchase.products.reduce((acc, product) => {
    const category = product.category;
    if (!acc[category]) {
      acc[category] = { total: 0, count: 0 };
    }
    acc[category].total += product.price * product.quantity;
    acc[category].count += product.quantity;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-gray-950 to-primary-black px-6 pt-12 pb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <button onClick={onBack} className="p-2 hover:bg-gray-800 rounded-[8px] transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2>Detalle de compra</h2>
              <small className="text-gray-400">
                {new Date(purchase.date).toLocaleDateString('es-ES', { 
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </small>
            </div>
          </div>

          {/* Total Card */}
          <Card className="bg-gradient-to-br from-secondary-gold/10 to-secondary-gold/5 border-secondary-gold/30">
            <div className="text-center">
              <small className="text-gray-400 block mb-2">Total de la compra</small>
              <h1 className="text-secondary-gold mb-3">${purchase.total.toFixed(2)}</h1>
              <div className="flex items-center justify-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-400" />
                  <span className="text-white">{purchase.itemCount} productos</span>
                </div>
                <div className="w-1 h-1 bg-gray-600 rounded-full" />
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-white">
                    {new Date(purchase.date).toLocaleDateString('es-ES', { 
                      day: 'numeric',
                      month: 'short'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="px-6">
        {/* Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h3 className="mb-3">Por categoría</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(categoryTotals).map(([category, data], index) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.05 }}
              >
                <Card className="text-center">
                  <div className="w-10 h-10 bg-secondary-gold/10 rounded-[10px] flex items-center justify-center mx-auto mb-2">
                    <Tag className="w-5 h-5 text-secondary-gold" />
                  </div>
                  <p className="text-white mb-1">${data.total.toFixed(2)}</p>
                  <small className="text-gray-400">{category}</small>
                  <div className="mt-1">
                    <span className="px-2 py-0.5 bg-gray-800 rounded-[4px] text-xs text-gray-400">
                      {data.count} items
                    </span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Products List */}
        <div>
          <h3 className="mb-3">Productos ({purchase.products.length})</h3>
          <div className="space-y-3">
            {purchase.products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
              >
                <Card>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-white mb-1">{product.name}</p>
                      <small className="text-gray-400">{product.category}</small>
                      
                      {product.barcode && (
                        <div className="mt-2">
                          <small className="text-gray-600 font-mono text-xs">
                            {product.barcode}
                          </small>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-gray-800 rounded-[6px] text-xs text-gray-400">
                            x{product.quantity}
                          </span>
                          <span className="text-gray-400 text-sm">
                            ${product.price.toFixed(2)} c/u
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-secondary-gold text-xl">
                        ${(product.price * product.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <Card className="bg-gray-950/50">
            <h4 className="text-white mb-4">Resumen</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white">${purchase.total.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Productos únicos</span>
                <span className="text-white">{purchase.products.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Cantidad total</span>
                <span className="text-white">{purchase.itemCount}</span>
              </div>
              <div className="h-px bg-gray-800 my-2" />
              <div className="flex items-center justify-between">
                <span className="text-white">Total</span>
                <span className="text-secondary-gold text-xl">${purchase.total.toFixed(2)}</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
