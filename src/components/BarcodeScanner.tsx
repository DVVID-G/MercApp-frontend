import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ScanBarcode } from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Button } from './Button';
import { Card } from './Card';
import { getProductByBarcode, Product as CatalogProduct } from '../services/product.service';
import { toast } from 'sonner';

interface BarcodeScannerProps {
  onProductFound: (product: CatalogProduct) => void;
  onProductNotFound: (barcode: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onProductFound, onProductNotFound, onClose }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanning = async () => {
    setError(null);
    setIsScanning(true);

    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length) {
        // Prefer back camera
        const cameraId = devices[devices.length - 1].id; 
        
        if (!scannerRef.current) {
            scannerRef.current = new Html5Qrcode("reader");
        }

        await scannerRef.current.start(
          { facingMode: "environment" }, 
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            formatsToSupport: [ 
                Html5QrcodeSupportedFormats.EAN_13,
                Html5QrcodeSupportedFormats.EAN_8,
                Html5QrcodeSupportedFormats.UPC_A,
                Html5QrcodeSupportedFormats.UPC_E,
                Html5QrcodeSupportedFormats.CODE_128,
                Html5QrcodeSupportedFormats.CODE_39
            ]
          },
          async (decodedText) => {
            // Success callback
            if (!mountedRef.current) return;
            
            // Stop scanning immediately
            if (scannerRef.current) {
                await scannerRef.current.stop();
                scannerRef.current = null;
            }
            setIsScanning(false);
            
            handleBarcodeDetected(decodedText);
          },
          (errorMessage) => {
            // Error callback (ignore for scanning errors)
          }
        );
      } else {
        setError("No se encontraron cámaras.");
        setIsScanning(false);
      }
    } catch (err) {
      console.error(err);
      setError("Error al iniciar la cámara. Verifica los permisos.");
      setIsScanning(false);
    }
  };

  const handleBarcodeDetected = async (barcode: string) => {
    try {
      toast.info(`Código detectado: ${barcode}`);
      const product = await getProductByBarcode(barcode);
      
      if (product) {
        onProductFound(product);
      } else {
        onProductNotFound(barcode);
      }
    } catch (err) {
      console.error("Error looking up product", err);
      toast.error("Error al buscar el producto");
    }
  };

  const stopScanning = async () => {
      if (scannerRef.current) {
          try {
            if (scannerRef.current.isScanning) {
                await scannerRef.current.stop();
            }
            scannerRef.current = null;
          } catch (e) {
              console.error("Failed to stop scanner", e);
          }
      }
      setIsScanning(false);
  };

  return (
    <div className="fixed inset-0 max-w-[390px] mx-auto bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-950 px-6 pt-12 pb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => { stopScanning(); onClose(); }} className="p-2 hover:bg-gray-800 rounded-[8px] transition-colors text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-white text-lg font-semibold">Escanear código</h2>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 relative">
        
        {/* Scanner Container */}
        <div id="reader" className="w-full max-w-sm overflow-hidden rounded-[24px] border-2 border-gray-800 bg-black"></div>

        {!isScanning && !error && (
             <div className="mt-8 w-full max-w-sm">
                <Button 
                    onClick={startScanning}
                    variant="primary"
                    icon={ScanBarcode}
                    fullWidth
                >
                    Iniciar Cámara
                </Button>
             </div>
        )}

        {error && (
            <div className="mt-4 text-error text-center">
                <p>{error}</p>
                <Button onClick={startScanning} variant="secondary" className="mt-4">Reintentar</Button>
            </div>
        )}

        {isScanning && (
            <p className="mt-4 text-gray-400 animate-pulse">Buscando código de barras...</p>
        )}
        
        {/* Instructions */}
        <Card className="mt-8 bg-gray-900/50 border-gray-800 w-full max-w-sm">
          <h4 className="text-white mb-2 text-sm font-medium">Instrucciones</h4>
          <ul className="space-y-1 text-gray-400 text-xs">
            <li>• Mantén el código dentro del cuadro</li>
            <li>• Asegura buena iluminación</li>
            <li>• Soporta EAN-13, UPC, Code-128</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
