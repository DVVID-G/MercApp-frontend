import { useState } from 'react';
import { ArrowLeft, Plus, Trash2, ScanBarcode, Save } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { Card } from './Card';
import { Purchase, Product } from '../App';
import { motion, AnimatePresence } from 'motion/react';

interface CreatePurchaseProps {
  onSave: (purchase: Purchase) => void;
  onCancel: () => void;
  onOpenScanner: () => void;
}

export function CreatePurchase({ onSave, onCancel, onOpenScanner }: CreatePurchaseProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    price: '',
    quantity: '1'
  });

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price) return;

    const product: Product = {
      id: Date.now().toString(),
      name: newProduct.name,
      category: newProduct.category || 'Sin categoría',
      price: parseFloat(newProduct.price),
      quantity: parseInt(newProduct.quantity) || 1
    };

    setProducts([...products, product]);
    setNewProduct({ name: '', category: '', price: '', quantity: '1' });
    setShowAddProduct(false);
  };

  const handleRemoveProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const handleSavePurchase = () => {
    if (products.length === 0) return;

    const total = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const itemCount = products.reduce((sum, p) => sum + p.quantity, 0);

    const purchase: Purchase = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      total,
      itemCount,
      products,
      synced: true
    };

    onSave(purchase);
  };

  const total = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-gray-950 to-primary-black px-6 pt-12 pb-6 sticky top-0 z-10">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={onCancel} className="p-2 hover:bg-gray-800 rounded-[8px] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2>Crear compra</h2>
            <small className="text-gray-400">Agrega productos a tu lista</small>
          </div>
        </div>
      </div>

      <div className="px-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button 
            onClick={() => setShowAddProduct(true)} 
            variant="primary"
            icon={Plus}
          >
            Agregar
          </Button>
          <Button 
            onClick={onOpenScanner} 
            variant="secondary"
            icon={ScanBarcode}
          >
            Escanear
          </Button>
        </div>

        {/* Products List */}
        <div className="mb-6">
          <h3 className="mb-4">Productos ({products.length})</h3>
          
          {products.length === 0 ? (
            <Card className="text-center py-8">
              <Plus className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 mb-1">No hay productos agregados</p>
              <small className="text-gray-600">Agrega productos manualmente o escanéalos</small>
            </Card>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-white mb-1">{product.name}</p>
                          <small className="text-gray-400">{product.category}</small>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="px-2 py-1 bg-gray-800 rounded-[6px] text-xs">
                              x{product.quantity}
                            </span>
                            <span className="text-secondary-gold">
                              ${(product.price * product.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveProduct(product.id)}
                          className="p-2 hover:bg-error/10 rounded-[8px] transition-colors text-error"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Total & Save */}
        {products.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="mb-4 bg-gradient-to-r from-secondary-gold/5 to-secondary-gold/10 border-secondary-gold/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 mb-1">Total de la compra</p>
                  <h2 className="text-secondary-gold">${total.toFixed(2)}</h2>
                </div>
              </div>
            </Card>

            <Button 
              onClick={handleSavePurchase}
              variant="primary"
              icon={Save}
              fullWidth
            >
              Guardar compra
            </Button>
          </motion.div>
        )}
      </div>

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddProduct && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddProduct(false)}
              className="fixed inset-0 bg-black/60 z-40"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed bottom-0 left-0 right-0 max-w-[390px] mx-auto bg-gray-950 rounded-t-[24px] p-6 z-50"
            >
              <div className="w-12 h-1 bg-gray-800 rounded-full mx-auto mb-6" />
              
              <h3 className="mb-6">Agregar producto</h3>
              
              <div className="space-y-4">
                <Input
                  label="Nombre del producto"
                  value={newProduct.name}
                  onChange={(val) => setNewProduct({ ...newProduct, name: val })}
                  placeholder="Ej: Leche entera"
                  required
                />
                
                <Input
                  label="Categoría"
                  value={newProduct.category}
                  onChange={(val) => setNewProduct({ ...newProduct, category: val })}
                  placeholder="Ej: Lácteos"
                />
                
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Precio"
                    type="number"
                    value={newProduct.price}
                    onChange={(val) => setNewProduct({ ...newProduct, price: val })}
                    placeholder="0.00"
                    required
                  />
                  
                  <Input
                    label="Cantidad"
                    type="number"
                    value={newProduct.quantity}
                    onChange={(val) => setNewProduct({ ...newProduct, quantity: val })}
                    placeholder="1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button variant="ghost" onClick={() => setShowAddProduct(false)}>
                    Cancelar
                  </Button>
                  <Button variant="primary" onClick={handleAddProduct}>
                    Agregar
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
