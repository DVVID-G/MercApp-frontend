import { Barcode, Scale } from 'lucide-react';
import { motion } from 'motion/react';

export interface ProductTypeSelectorProps {
  value: 'regular' | 'fruver';
  onChange: (type: 'regular' | 'fruver') => void;
  disabled?: boolean;
}

/**
 * Selector de tipo de producto con animación y accesibilidad
 * Permite elegir entre producto regular (con código de barras) o fruver (peso variable)
 */
export function ProductTypeSelector({ value, onChange, disabled = false }: ProductTypeSelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-gray-400 text-sm">
        Tipo de Producto <span className="text-secondary-gold">*</span>
      </label>
      
      <div className="grid grid-cols-2 gap-3">
        {/* Opción Regular */}
        <button
          type="button"
          onClick={() => !disabled && onChange('regular')}
          disabled={disabled}
          className={`
            relative flex flex-col items-center justify-center gap-3 p-6 rounded-[12px] border-2 transition-all
            ${value === 'regular' 
              ? 'border-secondary-gold bg-secondary-gold/10 text-white' 
              : 'border-gray-800 bg-gray-950 text-gray-400 hover:border-gray-700'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          aria-pressed={value === 'regular'}
          aria-label="Producto Regular con código de barras"
        >
          {/* Animación de selección */}
          {value === 'regular' && (
            <motion.div
              layoutId="product-type-indicator"
              className="absolute inset-0 border-2 border-secondary-gold rounded-[12px]"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
            />
          )}
          
          <Barcode className="w-8 h-8" />
          <div className="text-center">
            <p className="font-semibold">Producto Regular</p>
            <p className="text-xs mt-1 opacity-70">Con código de barras</p>
          </div>
        </button>

        {/* Opción Fruver */}
        <button
          type="button"
          onClick={() => !disabled && onChange('fruver')}
          disabled={disabled}
          className={`
            relative flex flex-col items-center justify-center gap-3 p-6 rounded-[12px] border-2 transition-all
            ${value === 'fruver' 
              ? 'border-secondary-gold bg-secondary-gold/10 text-white' 
              : 'border-gray-800 bg-gray-950 text-gray-400 hover:border-gray-700'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          aria-pressed={value === 'fruver'}
          aria-label="Producto Fruver de peso variable"
        >
          {/* Animación de selección */}
          {value === 'fruver' && (
            <motion.div
              layoutId="product-type-indicator"
              className="absolute inset-0 border-2 border-secondary-gold rounded-[12px]"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
            />
          )}
          
          <Scale className="w-8 h-8" />
          <div className="text-center">
            <p className="font-semibold">Fruver</p>
            <p className="text-xs mt-1 opacity-70">Peso variable</p>
          </div>
        </button>
      </div>
    </div>
  );
}

