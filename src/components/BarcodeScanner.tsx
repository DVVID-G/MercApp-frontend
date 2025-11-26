import { useState, useEffect } from 'react';
import { ArrowLeft, ScanBarcode, Check } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { Product } from '../App';
import { motion } from 'motion/react';

interface BarcodeScannerProps {
  onProductScanned: (product: Product) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onProductScanned, onClose }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);

  // Mock barcode scanning
  const mockProducts = [
    { barcode: '7501234567890', name: 'Leche Entera 1L', category: 'Lácteos', price: 25.50 },
    { barcode: '7501234567891', name: 'Pan Integral', category: 'Panadería', price: 32.00 },
    { barcode: '7501234567892', name: 'Yogurt Natural', category: 'Lácteos', price: 18.90 },
    { barcode: '7501234567893', name: 'Cereal Integral', category: 'Desayuno', price: 65.00 },
    { barcode: '7501234567894', name: 'Jugo de Naranja', category: 'Bebidas', price: 28.50 },
  ];

  const handleStartScanning = () => {
    setIsScanning(true);
    
    // Simulate barcode scanning after 2 seconds
    setTimeout(() => {
      const randomProduct = mockProducts[Math.floor(Math.random() * mockProducts.length)];
      const product: Product = {
        id: Date.now().toString(),
        barcode: randomProduct.barcode,
        name: randomProduct.name,
        category: randomProduct.category,
        price: randomProduct.price,
        quantity: 1
      };
      
      setScannedProduct(product);
      setIsScanning(false);
    }, 2000);
  };

  const handleConfirmProduct = () => {
    if (scannedProduct) {
      onProductScanned(scannedProduct);
    }
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-gray-950 to-primary-black px-6 pt-12 pb-6">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-[8px] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2>Escanear producto</h2>
            <small className="text-gray-400">Apunta al código de barras</small>
          </div>
        </div>
      </div>

      <div className="px-6">
        {/* Scanner Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6"
        >
          <div className="relative aspect-square bg-gray-950 border-2 border-dashed border-gray-800 rounded-[24px] overflow-hidden flex items-center justify-center">
            {/* Scanning Animation */}
            {isScanning && (
              <motion.div
                initial={{ top: 0 }}
                animate={{ top: '100%' }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="absolute left-0 right-0 h-1 bg-secondary-gold shadow-lg shadow-secondary-gold/50"
              />
            )}

            {/* Scanner Icon */}
            <div className="text-center">
              <motion.div
                animate={isScanning ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ScanBarcode className={`w-20 h-20 mx-auto mb-4 ${isScanning ? 'text-secondary-gold' : 'text-gray-600'}`} />
              </motion.div>
              <p className="text-gray-400">
                {isScanning ? 'Escaneando...' : 'Presiona el botón para iniciar'}
              </p>
            </div>

            {/* Corner Markers */}
            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-secondary-gold rounded-tl-[8px]" />
            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-secondary-gold rounded-tr-[8px]" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-secondary-gold rounded-bl-[8px]" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-secondary-gold rounded-br-[8px]" />
          </div>
        </motion.div>

        {/* Scanned Product Result */}
        {scannedProduct && !isScanning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
              <p className="text-success">Producto detectado</p>
            </div>

            <Card className="bg-gradient-to-br from-secondary-gold/10 to-secondary-gold/5 border-secondary-gold/30">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-white mb-2">{scannedProduct.name}</h3>
                  <small className="text-gray-400">{scannedProduct.category}</small>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                <div>
                  <small className="text-gray-400 block mb-1">Código de barras</small>
                  <p className="text-secondary-gold text-sm font-mono">{scannedProduct.barcode}</p>
                </div>
                <div className="text-right">
                  <small className="text-gray-400 block mb-1">Precio</small>
                  <p className="text-secondary-gold text-xl">${scannedProduct.price.toFixed(2)}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {!scannedProduct ? (
            <Button 
              onClick={handleStartScanning}
              variant="primary"
              icon={ScanBarcode}
              fullWidth
              disabled={isScanning}
            >
              {isScanning ? 'Escaneando...' : 'Iniciar escaneo'}
            </Button>
          ) : (
            <>
              <Button 
                onClick={handleConfirmProduct}
                variant="primary"
                icon={Check}
                fullWidth
              >
                Agregar producto
              </Button>
              <Button 
                onClick={() => {
                  setScannedProduct(null);
                  handleStartScanning();
                }}
                variant="secondary"
                fullWidth
              >
                Escanear otro
              </Button>
            </>
          )}
        </div>

        {/* Instructions */}
        <Card className="mt-6 bg-gray-950/50">
          <h4 className="text-white mb-3">Instrucciones</h4>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li className="flex gap-2">
              <span className="text-secondary-gold">•</span>
              <span>Mantén el código de barras dentro del marco</span>
            </li>
            <li className="flex gap-2">
              <span className="text-secondary-gold">•</span>
              <span>Asegúrate de tener buena iluminación</span>
            </li>
            <li className="flex gap-2">
              <span className="text-secondary-gold">•</span>
              <span>Mantén la cámara estable para mejor detección</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
