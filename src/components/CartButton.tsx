import { ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { usePurchase } from '../context/PurchaseContext';

interface CartButtonProps {
  onClick: () => void;
  className?: string;
}

/**
 * Botón de carrito con badge numérico que muestra la cantidad de productos
 * en la compra en progreso. Cumple con pautas WCAG.
 */
export function CartButton({ onClick, className = '' }: CartButtonProps) {
  const { getTotalItems, hasItems } = usePurchase();
  const itemCount = getTotalItems();

  // No mostrar si no hay items
  if (!hasItems) {
    return null;
  }

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={`relative p-2.5 rounded-[12px] bg-gray-900 hover:bg-gray-800 border-2 border-gray-800 hover:border-secondary-gold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-secondary-gold focus:ring-offset-2 focus:ring-offset-gray-950 ${className}`}
      aria-label={`Carrito de compra, ${itemCount} ${itemCount === 1 ? 'producto' : 'productos'}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <ShoppingCart className="w-6 h-6 text-secondary-gold" />
      
      {/* Badge numérico */}
      <AnimatePresence>
        {itemCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 flex items-center justify-center bg-secondary-gold text-primary-black text-xs font-bold rounded-full border-2 border-gray-950"
            aria-hidden="true"
          >
            {itemCount > 99 ? '99+' : itemCount}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

