import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { motion } from 'motion/react';

export interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  productType: 'regular' | 'fruver';
  min?: number;
  max?: number;
  disabled?: boolean;
}

/**
 * Componente reutilizable para seleccionar cantidad o peso de productos.
 * Se adapta automáticamente según el tipo de producto (regular vs fruver).
 */
export function QuantitySelector({
  value,
  onChange,
  productType,
  min = 1,
  max,
  disabled = false,
}: QuantitySelectorProps) {
  const [localValue, setLocalValue] = useState<number | ''>(value);
  const step = productType === 'fruver' ? 50 : 1;
  const label = productType === 'fruver' ? 'Peso (gramos)' : 'Cantidad';
  const placeholder = productType === 'fruver' ? 'Ej: 500' : 'Ej: 1';

  const handleIncrement = () => {
    if (disabled) return;
    const newValue = value + step;
    const finalValue = max ? Math.min(newValue, max) : newValue;
    onChange(finalValue);
  };

  const handleDecrement = () => {
    if (disabled) return;
    const newValue = value - step;
    const finalValue = Math.max(newValue, min);
    onChange(finalValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const inputValue = e.target.value;
    
    // Permitir campo vacío temporalmente mientras el usuario escribe
    if (inputValue === '') {
      setLocalValue('');
      return;
    }

    const numValue = productType === 'fruver' 
      ? parseFloat(inputValue) 
      : parseInt(inputValue, 10);

    if (isNaN(numValue)) {
      return; // Ignorar valores no numéricos
    }

    // Validar límites
    let finalValue = numValue;
    if (finalValue < min) {
      finalValue = min;
    }
    if (max && finalValue > max) {
      finalValue = max;
    }

    setLocalValue(finalValue);
    onChange(finalValue);
  };

  const handleInputBlur = () => {
    // Si el campo está vacío o inválido, restaurar al valor mínimo
    if (localValue === '' || (typeof localValue === 'number' && (isNaN(localValue) || localValue < min))) {
      setLocalValue(min);
      onChange(min);
    }
    // Si localValue es un número válido, mantenerlo (handleInputChange ya llamó onChange)
  };

  const displayValue = localValue === '' ? value : localValue;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-gray-400 text-sm">
        {label}
      </label>
      <div className="flex items-center gap-2">
        {/* Botón Decrementar */}
        <motion.button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || value <= min}
          whileHover={{ scale: disabled || value <= min ? 1 : 1.05 }}
          whileTap={{ scale: disabled || value <= min ? 1 : 0.95 }}
          className={`
            flex items-center justify-center w-12 h-12
            bg-gray-950 border-2 rounded-[8px]
            transition-all duration-200
            ${disabled || value <= min
              ? 'border-gray-800 text-gray-600 opacity-50 cursor-not-allowed'
              : 'border-gray-800 text-white hover:border-secondary-gold cursor-pointer'
            }
          `}
          aria-label={`Decrementar ${label.toLowerCase()}`}
        >
          <Minus className="w-5 h-5" />
        </motion.button>

        {/* Input Numérico */}
        <input
          type="number"
          value={displayValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onFocus={() => setLocalValue(value)}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          placeholder={placeholder}
          className={`
            flex-1 h-12 px-4
            bg-gray-950 border-2 border-gray-800 rounded-[8px]
            text-white text-center text-lg font-semibold
            placeholder:text-gray-600
            focus:outline-none focus:border-secondary-gold
            transition-colors duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          aria-label={label}
        />

        {/* Botón Incrementar */}
        <motion.button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || (max !== undefined && value >= max)}
          whileHover={{ scale: disabled || (max !== undefined && value >= max) ? 1 : 1.05 }}
          whileTap={{ scale: disabled || (max !== undefined && value >= max) ? 1 : 0.95 }}
          className={`
            flex items-center justify-center w-12 h-12
            bg-gray-950 border-2 rounded-[8px]
            transition-all duration-200
            ${disabled || (max !== undefined && value >= max)
              ? 'border-gray-800 text-gray-600 opacity-50 cursor-not-allowed'
              : 'border-gray-800 text-white hover:border-secondary-gold cursor-pointer'
            }
          `}
          aria-label={`Incrementar ${label.toLowerCase()}`}
        >
          <Plus className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
}

