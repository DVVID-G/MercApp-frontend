import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle } from 'lucide-react';

export interface SuccessModalProps {
  isOpen: boolean;
  productName: string;
  onClose: () => void;
  autoCloseDelay?: number; // default 2000ms
}

/**
 * Modal de confirmación que aparece después de crear un producto exitosamente.
 * Se cierra automáticamente después del delay configurado o manualmente.
 */
export function SuccessModal({
  isOpen,
  productName,
  onClose,
  autoCloseDelay = 2000,
}: SuccessModalProps) {
  // Auto-close después del delay
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      onClose();
    }, autoCloseDelay);

    return () => {
      clearTimeout(timer);
    };
  }, [isOpen, autoCloseDelay, onClose]);

  // Manejar tecla Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

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
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50"
            aria-hidden="true"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                       w-[calc(100%-48px)] max-w-[342px]
                       bg-gray-950 border-2 border-secondary-gold rounded-[16px] p-6
                       z-60"
            role="dialog"
            aria-modal="true"
            aria-labelledby="success-modal-title"
          >
            <div className="flex flex-col items-center text-center">
              {/* Icono de éxito */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 200, 
                  damping: 15,
                  delay: 0.1 
                }}
              >
                <CheckCircle className="w-12 h-12 text-secondary-gold mb-4" />
              </motion.div>

              {/* Título */}
              <h3
                id="success-modal-title"
                className="text-xl font-bold text-white mb-2"
              >
                ✅ Producto Creado
              </h3>

              {/* Nombre del producto */}
              <p className="text-gray-400 text-base mb-4 font-medium">
                {productName}
              </p>

              {/* Mensaje */}
              <p className="text-sm text-gray-500">
                El producto se agregará a tu compra
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

