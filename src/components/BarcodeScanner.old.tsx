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
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => { /* Ignore stop errors on unmount */ });
      }
    };
  }, []);

  const startScanning = async () => {
    setError(null);
    setIsScanning(true);

    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length) {
        // Try to find a back camera explicitly
        const backCamera = devices.find(device => 
            device.label.toLowerCase().includes('back') || 
            device.label.toLowerCase().includes('trasera') ||
            device.label.toLowerCase().includes('environment')
        );
        
        // Use specific camera ID if found, otherwise fallback to facingMode: environment
        // Using ID is often more reliable than facingMode on some devices
        const cameraIdOrConfig = backCamera ? backCamera.id : { facingMode: "environment" };
        
        if (!scannerRef.current) {
            scannerRef.current = new Html5Qrcode("reader", {
                formatsToSupport: [ 
                    Html5QrcodeSupportedFormats.EAN_13,
                    Html5QrcodeSupportedFormats.EAN_8,
                    Html5QrcodeSupportedFormats.UPC_A,
                    Html5QrcodeSupportedFormats.UPC_E,
                    Html5QrcodeSupportedFormats.CODE_128,
                    Html5QrcodeSupportedFormats.CODE_39
                ],
                verbose: false
            });
        }

        await scannerRef.current.start(
          cameraIdOrConfig, 
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          },
          async (decodedText) => {
            // Success callback
            if (!mountedRef.current) return;
            
            // Stop scanning immediately
            if (scannerRef.current) {
                try {
                    await scannerRef.current.stop();
                } catch (e) {
                    console.warn("Failed to stop scanner", e);
                }
                scannerRef.current = null;
            }
            setIsScanning(false);
            
            handleBarcodeDetected(decodedText);
          },
          () => {
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
            await scannerRef.current.stop();
          } catch (e) {
              // Ignore errors if scanner is not running
              console.warn("Failed to stop scanner", e);
          }
          scannerRef.current = null;
      }
      setIsScanning(false);
  };

  return (
    <div className="w-full max-w-[390px] mx-auto flex flex-col">
      {/* Header */}
      <div className="bg-gray-950 px-6 py-4 flex items-center justify-between border-b border-gray-800 mb-4 rounded-[16px]">
        <div className="flex items-center gap-4">
          <button onClick={() => { stopScanning(); onClose(); }} className="p-2 hover:bg-gray-800 rounded-[8px] transition-colors text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-white text-lg font-semibold">Escanear código</h2>
        </div>
      </div>

      <div className="flex-1 w-full">
        <div className="flex flex-col items-center justify-center gap-4">
          
          {/* Scanner Container */}
          <div id="reader" className="w-full max-w-sm overflow-hidden rounded-[24px] border-2 border-gray-800 bg-black flex-shrink-0 min-h-[250px]"></div>

          {!isScanning && !error && (
              <div className="w-full max-w-sm flex-shrink-0">
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
              <div className="text-error text-center flex-shrink-0">
                  <p>{error}</p>
                  <Button onClick={startScanning} variant="secondary" className="mt-4">Reintentar</Button>
              </div>
          )}

          {isScanning && (
              <p className="text-gray-400 animate-pulse flex-shrink-0">Buscando código de barras...</p>
          )}
          
          {/* Instructions */}
          <Card className="bg-gray-900/50 border-gray-800 w-full max-w-sm flex-shrink-0">
            <h4 className="text-white mb-2 text-sm font-medium">Instrucciones</h4>
            <ul className="space-y-1 text-gray-400 text-xs">
              <li>• Mantén el código dentro del cuadro</li>
              <li>• Asegura buena iluminación</li>
              <li>• Soporta EAN-13, UPC, Code-128</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
