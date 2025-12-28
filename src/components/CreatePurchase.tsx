import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Plus, Trash2, ScanBarcode, Save, Search } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { Purchase } from '../App';
import { PurchaseItem } from '../types/product';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { createPurchase } from '../services/purchases.service';
import { ProductSearchInput } from './ProductSearchInput';
import { ManualProductForm } from './ManualProductForm';
import { type ManualProductFormData } from '../validators/forms';
import { PriceUpdateModal } from './PriceUpdateModal';
import { updateProduct, createProduct } from '../services/product.service';
import type { 
  CatalogProduct,
  CreateProductRequest,
  CreateProductRegularRequest,
  CreateProductFruverRequest
} from '../types/product';
import { isProductRegular, isProductFruver } from '../types/product';
import { BarcodeScanner } from './BarcodeScanner';
import { SuccessModal } from './SuccessModal';
import { AddToCartCard } from './purchase/AddToCartCard';
import { usePurchase } from '../context/PurchaseContext';

interface CreatePurchaseProps {
  onSave: (purchase: Purchase) => void;
  onCancel: () => void;
  autoStartScanner?: boolean;
}

export function CreatePurchase({ onSave, onCancel, autoStartScanner = false }: CreatePurchaseProps) {
  const { draftProducts, addProduct, removeProduct, clearDraft } = usePurchase();
  const [products, setProducts] = useState<PurchaseItem[]>(draftProducts);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [showScanner, setShowScanner] = useState(autoStartScanner);
  const [scannedBarcode, setScannedBarcode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Sync local state with context on mount and when context changes
  useEffect(() => {
    setProducts(draftProducts);
  }, [draftProducts]);
  
  // New modals state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showAddToCart, setShowAddToCart] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<CatalogProduct | null>(null);
  
  // Add Product Modal view state: 'options' | 'search'
  const [addProductView, setAddProductView] = useState<'options' | 'search'>('options');
  
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

  const handleScanLookupError = (error: unknown) => {
    if (error instanceof Error) {
      console.error('Error looking up product:', error.message, error);
    } else {
      console.error('Error looking up product:', error);
    }
    toast.error('Error al buscar el producto. Verifica tu conexión e intenta nuevamente.');
    // Keep scanner open so user can retry
  };

  const handleProductSelect = (catalogProduct: CatalogProduct) => {
    // Store product for AddToCartCard instead of adding directly
    setPendingProduct(catalogProduct);
    setShowAddProduct(false);
    setAddProductView('options'); // Reset view for next time
    // Show AddToCartCard after a brief delay to allow modal close animation
    setTimeout(() => {
      setShowAddToCart(true);
    }, 300);
  };

  const handleManualProductSubmit = async (formData: ManualProductFormData & { productType: 'regular' | 'fruver' }) => {
    setIsLoading(true);
    try {
      // Create product in backend catalog first
      // Initialize with common required fields, properly typed
      const baseData: {
        name: string;
        marca: string;
        categoria: string;
        productType: 'regular' | 'fruver';
      } = {
        name: formData.name.trim(),
        marca: formData.marca.trim(),
        categoria: formData.categoria.trim(),
        productType: formData.productType,
      };

      // Build productData with proper typing based on product type
      let productData: CreateProductRequest;

      if (formData.productType === 'regular') {
        // Regular product: barcode is required
        const barcodeValue = formData.barcode?.trim() || '';
        if (!barcodeValue || barcodeValue.length < 8 || barcodeValue.length > 20) {
          throw new Error('El código de barras es requerido y debe tener entre 8 y 20 caracteres');
        }

        // Type assertion after validation to satisfy compiler
        const validatedBarcode: string = barcodeValue;

        productData = {
          name: baseData.name,
          marca: baseData.marca,
          categoria: baseData.categoria,
          productType: 'regular',
          barcode: validatedBarcode,
          price: formData.price,
          packageSize: formData.packageSize,
          umd: formData.umd,
        } satisfies CreateProductRegularRequest;
      } else {
        // Fruver product: barcode is optional
        // Normalize umd to 'g' | 'kg'
        const normalizedUmd: 'g' | 'kg' = 
          formData.umd === 'gramos' || formData.umd === 'g' ? 'g' : 
          formData.umd === 'kg' || formData.umd === 'kilogramos' ? 'kg' : 'g';

        // Only include barcode if provided, not empty, and valid length
        const barcodeValue = formData.barcode?.trim();
        const hasValidBarcode = barcodeValue && barcodeValue.length >= 8 && barcodeValue.length <= 20;

        // Type assertion after validation if barcode is present
        const validatedBarcode: string | undefined = hasValidBarcode ? barcodeValue : undefined;

        // Build fruver product data, conditionally including barcode
        // Only include barcode property if it's valid (don't set undefined)
        const fruverData: CreateProductFruverRequest = {
          name: baseData.name,
          marca: baseData.marca,
          categoria: baseData.categoria,
          productType: 'fruver',
          referencePrice: formData.price,
          referenceWeight: formData.packageSize,
          umd: normalizedUmd,
        };

        // Only add barcode property if it exists and is valid
        if (validatedBarcode !== undefined) {
          fruverData.barcode = validatedBarcode;
        }

        productData = fruverData;
      }

      console.log('Sending product data:', productData);
      const createdProduct = await createProduct(productData);
      console.log('Product created successfully:', createdProduct);

      // Store product for AddToCartCard instead of adding directly
      setPendingProduct(createdProduct);
      setShowManualForm(false);
      
      // Show success modal first
      setShowSuccessModal(true);
      
      // Get price based on product type
      const displayPrice = isProductRegular(createdProduct) 
        ? createdProduct.price 
        : isProductFruver(createdProduct)
        ? createdProduct.referencePrice
        : 0;
      
      toast.success(`✨ Producto creado: ${createdProduct.name}`, {
        description: `${createdProduct.marca} • $${displayPrice.toFixed(2)}`
      });
    } catch (err: any) {
      console.error('Error creating product:', err);
      console.error('Error response:', err.response?.data);
      
      // Extract validation errors from backend response
      let errorMessage = 'No se pudo guardar en el catálogo';
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        console.error('Validation errors:', errors);
        const errorMessages = Object.entries(errors)
          .map(([field, error]: [string, any]) => {
            if (typeof error === 'object' && error._errors) {
              return `${field}: ${error._errors.join(', ')}`;
            }
            if (typeof error === 'object') {
              return `${field}: ${JSON.stringify(error)}`;
            }
            return `${field}: ${error}`;
          })
          .join('; ');
        errorMessage = errorMessages || errorMessage;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      toast.error('❌ Error al crear producto', {
        description: errorMessage
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

  // Handler for success modal close - transitions to AddToCartCard
  // Memoized to prevent SuccessModal effects from resetting
  const handleSuccessModalClose = useCallback(() => {
    setShowSuccessModal(false);
    // Wait for modal close animation before showing AddToCartCard
    setTimeout(() => {
      if (pendingProduct) {
        setShowAddToCart(true);
      }
    }, 300);
  }, [pendingProduct]);

  // Handler for AddToCartCard - adds product with selected quantity
  const handleAddToCart = (quantity: number) => {
    if (!pendingProduct) return;

    // For PurchaseItem, price should be the UNIT price (not total)
    // - Regular: price per package
    // - Fruver: PUM (price per gram)
    const unitPrice = isProductRegular(pendingProduct)
      ? pendingProduct.price
      : isProductFruver(pendingProduct)
      ? (pendingProduct.pum || 0) // PUM is already price per gram
      : 0;

    const newProduct: PurchaseItem = isProductRegular(pendingProduct)
      ? {
          entryId: crypto.randomUUID(),
          id: pendingProduct._id,
          name: pendingProduct.name,
          marca: pendingProduct.marca,
          category: pendingProduct.categoria,
          price: unitPrice, // Store unit price
          quantity: quantity,
          packageSize: pendingProduct.packageSize,
          pum: pendingProduct.pum,
          umd: pendingProduct.umd,
          productType: 'regular',
          barcode: pendingProduct.barcode,
        }
      : {
          entryId: crypto.randomUUID(),
          id: pendingProduct._id,
          name: pendingProduct.name,
          marca: pendingProduct.marca,
          category: pendingProduct.categoria,
          price: unitPrice, // Store unit price (PUM)
          quantity: quantity,
          packageSize: pendingProduct.referenceWeight,
          pum: pendingProduct.pum,
          umd: pendingProduct.umd,
          productType: 'fruver',
          barcode: pendingProduct.barcode,
        };

    // Add to both local state and context
    setProducts([...products, newProduct]);
    addProduct(newProduct);
    setShowAddToCart(false);
    setPendingProduct(null);

    // Calculate total for toast message
    const totalPrice = unitPrice * quantity;

    toast.success(`✅ ${newProduct.name} agregado a tu compra`, {
      description: `Cantidad: ${quantity}${pendingProduct.productType === 'fruver' ? 'g' : ''} • Total: $${totalPrice.toFixed(2)}`
    });
  };

  // Handler for canceling AddToCartCard
  const handleCancelAddToCart = () => {
    setShowAddToCart(false);
    setPendingProduct(null);
    toast.info('Producto creado pero no agregado a la compra');
  };

  const handleRemoveProduct = (entryId: string) => {
    const product = products.find(p => p.entryId === entryId);
    setProducts(products.filter((p: PurchaseItem) => p.entryId !== entryId));
    removeProduct(entryId); // Also remove from context
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
        productType: p.productType,
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
          barcode: p.barcode || '',
          name: p.name,
          marca: p.marca,
          category: p.category,
          price: p.price,
          quantity: p.quantity,
          packageSize: p.packageSize,
          pum: p.pum,
          umd: p.umd,
          productType: p.productType,
        })),
        synced: true
      };

      toast.success(`🎉 Compra guardada exitosamente`, {
        description: `${products.length} productos • Total: $${purchase.total.toFixed(2)}`
      });
      
      // Clear draft purchase from context
      clearDraft();
      
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
    
    // Get unit price based on product type
    const unitPrice = isProductRegular(product)
      ? product.price
      : isProductFruver(product)
      ? (product.pum || 0)
      : 0;
    
    // Add product with catalog price
    const newProduct: PurchaseItem = isProductRegular(product)
      ? {
          entryId: crypto.randomUUID(),
          id: product._id,
          name: product.name,
          marca: product.marca,
          category: product.categoria,
          price: unitPrice,
          quantity,
          packageSize: product.packageSize,
          pum: product.pum,
          umd: product.umd,
          productType: 'regular',
          barcode: product.barcode,
        }
      : {
          entryId: crypto.randomUUID(),
          id: product._id,
          name: product.name,
          marca: product.marca,
          category: product.categoria,
          price: unitPrice,
          quantity,
          packageSize: product.referenceWeight,
          pum: product.pum,
          umd: product.umd,
          productType: 'fruver',
          barcode: product.barcode,
        };
    
    setProducts([...products, newProduct]);
    addProduct(newProduct); // Sync with context
    setPriceModalOpen(false);
    setPriceModalData(null);
  };

  const handleUpdateCatalog = async () => {
    if (!priceModalData) return;
    
    const { product, newPrice, quantity } = priceModalData;
    
    try {
      // Update catalog price based on product type
      const updateData = isProductRegular(product)
        ? { price: newPrice }
        : isProductFruver(product)
        ? { referencePrice: newPrice }
        : {};
      
      await updateProduct(product._id, updateData);
      
      // Calculate unit price for PurchaseItem
      const packageSize = isProductRegular(product)
        ? product.packageSize
        : isProductFruver(product)
        ? product.referenceWeight
        : 1;
      
      const unitPrice = packageSize > 0 ? newPrice / packageSize : newPrice;
      
      // Add product with new price
      const newProduct: PurchaseItem = isProductRegular(product)
        ? {
            entryId: crypto.randomUUID(),
            id: product._id,
            name: product.name,
            marca: product.marca,
            category: product.categoria,
            price: unitPrice,
            quantity,
            packageSize,
            pum: unitPrice,
            umd: product.umd,
            productType: 'regular',
            barcode: product.barcode,
          }
        : {
            entryId: crypto.randomUUID(),
            id: product._id,
            name: product.name,
            marca: product.marca,
            category: product.categoria,
            price: unitPrice,
            quantity,
            packageSize,
            pum: unitPrice,
            umd: product.umd,
            productType: 'fruver',
            barcode: product.barcode,
          };
      
      setProducts([...products, newProduct]);
      addProduct(newProduct); // Sync with context
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
    
    // Calculate unit price for PurchaseItem
    const packageSize = isProductRegular(product)
      ? product.packageSize
      : isProductFruver(product)
      ? product.referenceWeight
      : 1;
    
    const unitPrice = packageSize > 0 ? newPrice / packageSize : newPrice;
    
    // Add product with new price (don't update catalog)
    const newProduct: PurchaseItem = isProductRegular(product)
      ? {
          entryId: crypto.randomUUID(),
          id: product._id,
          name: product.name,
          marca: product.marca,
          category: product.categoria,
          price: unitPrice,
          quantity,
          packageSize,
          pum: unitPrice,
          umd: product.umd,
          productType: 'regular',
          barcode: product.barcode,
        }
      : {
          entryId: crypto.randomUUID(),
          id: product._id,
          name: product.name,
          marca: product.marca,
          category: product.categoria,
          price: unitPrice,
          quantity,
          packageSize,
          pum: unitPrice,
          umd: product.umd,
          productType: 'fruver',
          barcode: product.barcode,
        };
    
    setProducts([...products, newProduct]);
    addProduct(newProduct); // Sync with context
    setPriceModalOpen(false);
    setPriceModalData(null);
  };

  const total = products.reduce((sum: number, p: PurchaseItem) => sum + (p.price * p.quantity), 0);

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
                {products.map((product: PurchaseItem, index: number) => (
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
                          type="button"
                          onClick={() => handleRemoveProduct(product.entryId)}
                          className="p-2 hover:bg-error/10 rounded-[8px] transition-colors text-error"
                          aria-label="Eliminar producto"
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
              onClick={() => {
                setShowAddProduct(false);
                // Reset view after animation completes
                setTimeout(() => setAddProductView('options'), 300);
              }}
              className="fixed inset-0 bg-black/60 z-40"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 max-w-[390px] mx-auto bg-gray-950 border-t-2 border-gray-800 rounded-t-[24px] z-50 flex flex-col"
              style={{ 
                maxHeight: '90vh',
                height: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1 bg-gray-800 rounded-full mx-auto mt-3 mb-4 flex-shrink-0" />
              
              {/* Scrollable content area */}
              <div 
                className="flex-1 overflow-y-auto px-6 pb-6 min-h-0" 
                style={{ 
                  WebkitOverflowScrolling: 'touch',
                  overscrollBehavior: 'contain',
                }}
              >
              
              {/* Options View (Initial) */}
              <AnimatePresence mode="wait">
                {addProductView === 'options' && (
                  <motion.div
                    key="options"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h3 className="text-xl font-bold text-white mb-2">Agregar Producto</h3>
                    <p className="text-sm text-gray-400 mb-6">Busca en tu catálogo o crea uno nuevo</p>
                    
                    <div className="space-y-4">
                      {/* Option Cards */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* Buscar Existente */}
                        <motion.button
                          type="button"
                          onClick={() => setAddProductView('search')}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex flex-col items-center justify-center gap-3 p-6 rounded-[12px] border-2 border-gray-800 hover:border-secondary-gold transition-all bg-gray-950"
                        >
                          <Search className="w-8 h-8 text-secondary-gold" />
                          <span className="text-sm font-semibold text-white">Buscar</span>
                          <span className="text-xs text-gray-400">Catálogo existente</span>
                        </motion.button>

                        {/* Crear Nuevo */}
                        <motion.button
                          type="button"
                          onClick={() => {
                            setShowAddProduct(false);
                            setAddProductView('options'); // Reset for next time
                            setShowManualForm(true);
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex flex-col items-center justify-center gap-3 p-6 rounded-[12px] border-2 border-gray-800 hover:border-secondary-gold transition-all bg-gray-950"
                        >
                          <Plus className="w-8 h-8 text-secondary-gold" />
                          <span className="text-sm font-semibold text-white">Crear</span>
                          <span className="text-xs text-gray-400">Nuevo producto</span>
                        </motion.button>
                      </div>

                      <Button 
                        variant="secondary" 
                        onClick={() => {
                          setShowAddProduct(false);
                          // Reset view after animation completes
                          setTimeout(() => setAddProductView('options'), 300);
                        }} 
                        fullWidth
                      >
                        Cancelar
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Search View */}
                {addProductView === 'search' && (
                  <motion.div
                    key="search"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col h-full"
                  >
                    {/* Header - Fixed */}
                    <div className="flex items-center gap-3 mb-4 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => setAddProductView('options')}
                        className="p-2 hover:bg-gray-800 rounded-[8px] transition-colors flex-shrink-0"
                        aria-label="Volver a opciones"
                      >
                        <ArrowLeft className="w-5 h-5 text-white" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-white truncate">Buscar Producto</h3>
                        <p className="text-sm text-gray-400">Escribe el nombre del producto</p>
                      </div>
                    </div>
                    
                    {/* Search Input - Scrollable area */}
                    <div className="flex-1 min-h-0 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
                      <ProductSearchInput 
                        onProductSelect={handleProductSelect}
                        onNoResults={handleNoResults}
                        placeholder="Ej: Leche, Arroz, Manzanas..."
                        mode="name"
                        autoFocus
                        hideModeToggle={true}
                        compact={true}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              </div>
              {/* End scrollable content area */}
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
          catalogPrice={
            isProductRegular(priceModalData.product)
              ? priceModalData.product.price
              : isProductFruver(priceModalData.product)
              ? priceModalData.product.referencePrice
              : 0
          }
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

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        productName={pendingProduct?.name || ''}
        onClose={handleSuccessModalClose}
        autoCloseDelay={2000}
      />

      {/* Add to Cart Card */}
      {pendingProduct && (
        <AddToCartCard
          isOpen={showAddToCart}
          product={pendingProduct}
          onAddToCart={handleAddToCart}
          onCancel={handleCancelAddToCart}
        />
      )}
    </div>
  );
}
