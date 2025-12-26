import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, ScanBarcode, Save } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { Purchase, Product } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { createPurchase } from '../services/purchases.service';
import { ProductSearchInput } from './ProductSearchInput';
import { ManualProductForm } from './ManualProductForm';
import { type ManualProductFormData } from '../validators/forms';
import { PriceUpdateModal } from './PriceUpdateModal';
import { updateProduct, createProduct, type Product as CatalogProduct } from '../services/product.service';
import { BarcodeScanner } from './BarcodeScanner';

interface CreatePurchaseProps {
  onSave: (purchase: Purchase) => void;
  onCancel: () => void;
  autoStartScanner?: boolean;
}

interface PurchaseItem extends Product {
  // Product ya incluye marca y barcode
}

export function CreatePurchase({ onSave, onCancel, autoStartScanner = false }: CreatePurchaseProps) {
  const [products, setProducts] = useState<PurchaseItem[]>([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [showScanner, setShowScanner] = useState(autoStartScanner);
  const [scannedBarcode, setScannedBarcode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Effect to handle autoStartScanner prop changes if it changes after mount
  useEffect(() => {
    if (autoStartScanner) {
      setShowScanner(true);
    }
  }, [autoStartScanner]);

  // Price update modal state
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [priceModalData, setPriceModalData] = useState<{
    product: CatalogProduct;
    newPrice: number;
    quantity: number;
  } | null>(null);

  const handleScanSuccess = (product: CatalogProduct) => {
    handleProductSelect(product);
    setShowScanner(false);
  };

  const handleScanNotFound = (barcode: string) => {
    setScannedBarcode(barcode);
    setShowScanner(false);
    setShowManualForm(true);
    toast.info(`Producto no encontrado. Créalo ahora.`);
  };

  const handleScanLookupError = (error: any, barcode: string) => {
    console.error('Error looking up product:', error);
    toast.error('Error al buscar el producto. Verifica tu conexión e intenta nuevamente.');
    // Keep scanner open so user can retry
  };

  const handleProductSelect = (catalogProduct: CatalogProduct) => {
    // Check if product already exists in list
    const existingProduct = products.find(p => p.id === catalogProduct._id);
    
    if (existingProduct) {
      // Increment quantity
      setProducts(products.map(p => 
        p.id === catalogProduct._id 
          ? { ...p, quantity: p.quantity + 1 }
          : p
      ));
      toast.success(`🔺 Cantidad actualizada`, {
        description: `${catalogProduct.name} x${existingProduct.quantity + 1}`
      });
    } else {
      // Add new product
      const newProduct: PurchaseItem = {
        id: catalogProduct._id,
        name: catalogProduct.name,
        marca: catalogProduct.marca,
        category: catalogProduct.categoria,
        price: catalogProduct.price,
        quantity: 1,
        packageSize: catalogProduct.packageSize,
        pum: catalogProduct.pum,
        umd: catalogProduct.umd,
        barcode: catalogProduct.barcode,
      };
      
      setProducts([...products, newProduct]);
      toast.success(`✅ ${catalogProduct.name} agregado`, {
        description: `${catalogProduct.marca} • $${catalogProduct.price.toFixed(2)}`
      });
    }
    
    setShowAddProduct(false);
  };

  const handleManualProductSubmit = async (formData: ManualProductFormData) => {
    setIsLoading(true);
    try {
      // Create product in backend catalog first
      const createdProduct = await createProduct({
        name: formData.name,
        marca: formData.marca,
        price: formData.price,
        packageSize: formData.packageSize,
        umd: formData.umd,
        barcode: formData.barcode,
        categoria: formData.categoria,
      });

      // Add to local purchase list using the real backend ID
      const newProduct: PurchaseItem = {
        id: createdProduct._id,
        name: createdProduct.name,
        marca: createdProduct.marca,
        category: createdProduct.categoria,
        price: createdProduct.price,
        quantity: 1,
        packageSize: createdProduct.packageSize,
        pum: createdProduct.pum,
        umd: createdProduct.umd,
        barcode: createdProduct.barcode,
      };
      
      setProducts([...products, newProduct]);
      setShowManualForm(false);
      toast.success(`✨ Producto creado: ${createdProduct.name}`, {
        description: `${createdProduct.marca} • $${createdProduct.price.toFixed(2)}`
      });
    } catch (err) {
      console.error('Error creating product:', err);
      toast.error('❌ Error al crear producto', {
        description: 'No se pudo guardar en el catálogo'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNoResults = () => {
    // When product not found, show manual form
    setShowAddProduct(false);
    setShowManualForm(true);
  };

  const handleRemoveProduct = (id: string) => {
    const product = products.find(p => p.id === id);
    setProducts(products.filter((p: Product) => p.id !== id));
    if (product) {
      toast.info(`🗑️ ${product.name} eliminado`);
    }
  };

  const handleSavePurchase = async () => {
    if (products.length === 0) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Transform frontend products to backend items format with all required fields
      const items = products.map((p: PurchaseItem) => ({
        name: p.name,
        marca: p.marca,
        price: p.price,
        quantity: p.quantity,
        packageSize: p.packageSize,
        umd: p.umd,
        barcode: p.barcode,
        categoria: p.category,
      }));

      // Call backend API
      const response = await createPurchase({ items });
      
      // Check for price warnings
      if (response.priceWarnings && response.priceWarnings.length > 0) {
        console.log('Price warnings detected:', response.priceWarnings);
        // Handle price warnings if needed in future versions
      }
      
      // Transform response to frontend Purchase format
      const purchase: Purchase = {
        id: response.id,
        date: response.createdAt,
        total: response.total,
        itemCount: products.reduce((sum: number, p: PurchaseItem) => sum + p.quantity, 0),
        products: products.map(p => ({
          id: p.id,
          barcode: p.barcode,
          name: p.name,
          marca: p.marca,
          category: p.category,
          price: p.price,
          quantity: p.quantity,
          packageSize: p.packageSize,
          pum: p.pum,
          umd: p.umd,
        })),
        synced: true
      };

      toast.success(`🎉 Compra guardada exitosamente`, {
        description: `${products.length} productos • Total: $${purchase.total.toFixed(2)}`
      });
      onSave(purchase);
    } catch (err: any) {
      console.error('Error saving purchase:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.errors?.[0]?.messages?.[0] || 
                          'Error al guardar la compra. Verifica que todos los campos requeridos estén completos.';
      setError(errorMessage);
      toast.error('❌ Error al guardar compra', {
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseCatalogPrice = async () => {
    if (!priceModalData) return;
    
    const { product, quantity } = priceModalData;
    
    // Add product with catalog price
    const newProduct: PurchaseItem = {
      id: product._id,
      name: product.name,
      marca: product.marca,
      category: product.categoria,
      price: product.price, // Use catalog price
      quantity,
      packageSize: product.packageSize,
      pum: product.pum,
      umd: product.umd,
      barcode: product.barcode,
    };
    
    setProducts([...products, newProduct]);
    setPriceModalOpen(false);
    setPriceModalData(null);
  };

  const handleUpdateCatalog = async () => {
    if (!priceModalData) return;
    
    const { product, newPrice, quantity } = priceModalData;
    
    try {
      // Update catalog price
      await updateProduct(product._id, { price: newPrice });
      
      // Add product with new price
      const newProduct: PurchaseItem = {
        id: product._id,
        name: product.name,
        marca: product.marca,
        category: product.categoria,
        price: newPrice, // Use new price
        quantity,
        packageSize: product.packageSize,
        pum: product.packageSize > 0 ? newPrice / product.packageSize : undefined,
        umd: product.umd,
        barcode: product.barcode,
      };
      
      setProducts([...products, newProduct]);
      toast.success(`💾 Precio actualizado en catálogo`, {
        description: `${product.name} • $${newPrice.toFixed(2)}`
      });
      setPriceModalOpen(false);
      setPriceModalData(null);
    } catch (err) {
      console.error('Error updating catalog price:', err);
      setError('Error al actualizar el precio en el catálogo');
      toast.error('❌ Error al actualizar precio', {
        description: 'El producto se agregó pero no se pudo actualizar el catálogo'
      });
    }
  };

  const handleUseNewPriceOnce = async () => {
    if (!priceModalData) return;
    
    const { product, newPrice, quantity } = priceModalData;
    
    // Add product with new price (don't update catalog)
    const newProduct: PurchaseItem = {
      id: product._id,
      name: product.name,
      marca: product.marca,
      category: product.categoria,
      price: newPrice, // Use new price
      quantity,
      packageSize: product.packageSize,
      pum: product.packageSize > 0 ? newPrice / product.packageSize : undefined,
      umd: product.umd,
      barcode: product.barcode,
    };
    
    setProducts([...products, newProduct]);
    setPriceModalOpen(false);
    setPriceModalData(null);
  };

  const total = products.reduce((sum: number, p: Product) => sum + (p.price * p.quantity), 0);

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
            onClick={() => setShowScanner(!showScanner)} 
            variant={showScanner ? "primary" : "secondary"}
            icon={ScanBarcode}
          >
            {showScanner ? "Cerrar" : "Escanear"}
          </Button>
        </div>

        {/* Embedded Scanner */}
        <AnimatePresence>
          {showScanner && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-6"
            >
              <BarcodeScanner 
                onProductFound={handleScanSuccess}
                onProductNotFound={handleScanNotFound}
                onProductLookupError={handleScanLookupError}
                onClose={() => setShowScanner(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

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
                {products.map((product: Product, index: number) => (
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
                          <small className="text-gray-400">{product.marca} • {product.category}</small>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="px-2 py-1 bg-gray-800 rounded-[6px] text-xs">
                              x{product.quantity}
                            </span>
                            <span className="text-secondary-gold">
                              ${(product.price * product.quantity).toFixed(2)}
                            </span>
                            {product.pum && product.umd && (
                              <span className="px-2 py-1 bg-primary-gold/10 rounded-[6px] text-xs text-primary-gold">
                                ${product.pum.toFixed(2)}/{product.umd}
                              </span>
                            )}
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

        {/* Error Display */}
        {error && (
          <Card className="mb-4 bg-error/10 border-error/20">
            <p className="text-error text-sm">{error}</p>
          </Card>
        )}

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
              disabled={isLoading}
            >
              {isLoading ? 'Guardando...' : 'Guardar compra'}
            </Button>
          </motion.div>
        )}
      </div>

      {/* Product Search Modal */}
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
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 max-w-[390px] mx-auto bg-gray-950 border-t-2 border-gray-800 rounded-t-[24px] p-6 z-50"
            >
              <div className="w-12 h-1 bg-gray-800 rounded-full mx-auto mb-6" />
              
              <h3 className="text-xl font-bold text-white mb-6">Buscar producto</h3>
              
              <div className="space-y-4">
                <ProductSearchInput 
                  onProductSelect={handleProductSelect}
                  onNoResults={handleNoResults}
                  autoFocus
                />
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-800" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-gray-950 px-2 text-gray-600">o</span>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    setShowAddProduct(false);
                    setShowManualForm(true);
                  }}
                  className="w-full py-2.5 text-center text-sm font-medium text-secondary-gold hover:text-yellow-400 transition-colors flex items-center justify-center gap-2"
                >
                  ✨ Crear producto manualmente
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>

                <Button variant="secondary" onClick={() => setShowAddProduct(false)} fullWidth>
                  Cancelar
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>



      {/* Manual Product Form Modal */}
      <AnimatePresence>
        {showManualForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowManualForm(false)}
              className="fixed inset-0 bg-black/60 z-40"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed bottom-0 left-0 right-0 max-w-[390px] mx-auto bg-gray-950 rounded-t-[24px] p-6 z-50 max-h-[90vh] overflow-y-auto"
            >
              <div className="w-12 h-1 bg-gray-800 rounded-full mx-auto mb-6" />
              
              <ManualProductForm
                onSubmit={handleManualProductSubmit}
                onCancel={() => setShowManualForm(false)}
                isLoading={isLoading}
                initialData={{ barcode: scannedBarcode }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Price Update Modal */}
      {priceModalData && (
        <PriceUpdateModal
          isOpen={priceModalOpen}
          productName={priceModalData.product.name}
          catalogPrice={priceModalData.product.price}
          newPrice={priceModalData.newPrice}
          onUseCatalogPrice={handleUseCatalogPrice}
          onUpdateCatalog={handleUpdateCatalog}
          onUseNewPriceOnce={handleUseNewPriceOnce}
          onClose={() => {
            setPriceModalOpen(false);
            setPriceModalData(null);
          }}
        />
      )}
    </div>
  );
}
