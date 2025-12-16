import { LucideIcon } from 'lucide-react';
import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ 
  label, 
  type = 'text', 
  className = '',
  icon: Icon,
  error,
  required,
  ...props
}, ref) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-gray-400 text-sm">
        {label} {required && <span className="text-secondary-gold">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={`w-full bg-gray-950 border ${error ? 'border-error' : 'border-gray-800'} rounded-[8px] px-4 py-3 ${Icon ? 'pl-11' : ''} text-white placeholder:text-gray-600 focus:outline-none focus:border-secondary-gold transition-colors ${className}`}
          {...props}
        />
      </div>
      {error && (
        <span className="text-error text-sm">{error}</span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
