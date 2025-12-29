import { useState, useEffect, forwardRef } from 'react';
import { DollarSign } from 'lucide-react';
import { formatCOP, parseCOPInput } from '../../utils/currency';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Input con formato de moneda colombiana (COP)
 * Muestra el formato $X.XXX mientras el usuario escribe
 * y devuelve el valor numérico sin formato
 */
export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, label, placeholder, error, required, disabled, className = '' }, ref) => {
    const [displayValue, setDisplayValue] = useState(formatCOP(value || 0));
    const [isFocused, setIsFocused] = useState(false);

    // Actualizar display cuando cambia el valor externo
    useEffect(() => {
      if (!isFocused) {
        setDisplayValue(formatCOP(value || 0));
      }
    }, [value, isFocused]);

    const handleFocus = () => {
      setIsFocused(true);
      // Mostrar solo el número cuando está enfocado
      setDisplayValue(value > 0 ? value.toString() : '');
    };

    const handleBlur = () => {
      setIsFocused(false);
      // Aplicar formato cuando pierde el foco
      setDisplayValue(formatCOP(value || 0));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const numericValue = parseCOPInput(inputValue);
      
      // Actualizar display mientras escribe
      setDisplayValue(inputValue);
      
      // Notificar cambio al padre
      onChange(numericValue);
    };

    return (
      <div className="flex flex-col gap-2">
        <label className="text-gray-400 text-sm">
          {label} {required && <span className="text-secondary-gold">*</span>}
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
            <DollarSign className="w-5 h-5" />
          </div>
          <input
            ref={ref}
            type="text"
            inputMode="numeric"
            className={`
              w-full bg-gray-950 border rounded-[8px] px-4 py-3 pl-11 text-white 
              placeholder:text-gray-600 focus:outline-none transition-colors
              ${error ? 'border-error' : 'border-gray-800 focus:border-secondary-gold'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              ${className}
            `}
            value={displayValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder || '$0'}
            disabled={disabled}
          />
        </div>
        {error && <span className="text-error text-sm">{error}</span>}
      </div>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';


