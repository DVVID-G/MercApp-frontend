import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { searchProducts, getProductByBarcode, Product } from '../services/product.service';

export type SearchMode = 'barcode' | 'name';

export interface ProductSearchInputProps {
  onProductSelect: (product: Product) => void;
  onNoResults?: () => void;
  placeholder?: string;
  mode?: SearchMode;
  autoFocus?: boolean;
}

export function ProductSearchInput({
  onProductSelect,
  onNoResults,
  placeholder = 'Buscar producto...',
  mode: initialMode = 'barcode',
  autoFocus = false,
}: ProductSearchInputProps) {
  const [searchMode, setSearchMode] = useState<SearchMode>(initialMode);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Debounced search for name mode
  useEffect(() => {
    if (searchMode === 'name' && query.trim().length >= 2) {
      // Clear previous timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new timer
      debounceTimerRef.current = setTimeout(async () => {
        setIsLoading(true);
        try {
          const results = await searchProducts({ q: query, limit: 10 });
          setSuggestions(results);
          setShowSuggestions(true);
          setSelectedIndex(-1);
        } catch (error) {
          console.error('Error searching products:', error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, searchMode]);

  const handleBarcodeSearch = async (barcode: string) => {
    if (!barcode.trim()) return;

    setIsLoading(true);
    try {
      const product = await getProductByBarcode(barcode);
      if (product) {
        onProductSelect(product);
        setQuery('');
      } else {
        onNoResults?.();
      }
    } catch (error) {
      console.error('Error fetching product by barcode:', error);
      onNoResults?.();
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (searchMode === 'barcode') {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleBarcodeSearch(query);
      }
    } else {
      // Name search mode - keyboard navigation
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, -1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelectProduct(suggestions[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    }
  };

  const handleSelectProduct = (product: Product) => {
    onProductSelect(product);
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const toggleSearchMode = () => {
    setSearchMode((prev) => (prev === 'barcode' ? 'name' : 'barcode'));
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) => 
      regex.test(part) ? <mark key={index} className="bg-secondary-gold bg-opacity-30 text-white font-semibold">{part}</mark> : part
    );
  };

  return (
    <div className="relative w-full">
      {/* Search Mode Toggle */}
      <div className="flex gap-2 mb-4 bg-gray-900 p-1 rounded-[12px] border-2 border-gray-800">
        <button
          type="button"
          onClick={toggleSearchMode}
          className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-[8px] transition-all duration-200 ${
            searchMode === 'barcode'
              ? 'bg-gray-950 text-white shadow-lg border-2 border-gray-700'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          🔍 Código de Barras
        </button>
        <button
          type="button"
          onClick={toggleSearchMode}
          className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-[8px] transition-all duration-200 ${
            searchMode === 'name'
              ? 'bg-gray-950 text-white shadow-lg border-2 border-gray-700'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          📄 Buscar por Nombre
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type={searchMode === 'barcode' ? 'text' : 'search'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            searchMode === 'barcode' ? 'Escanea o ingresa código de barras' : placeholder
          }
          className="w-full px-4 py-3 bg-gray-950 text-white border-2 border-gray-800 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-secondary-gold focus:border-secondary-gold placeholder:text-gray-600 transition-colors"
          disabled={isLoading}
        />

        {/* Loading Indicator or Clear Button */}
        {isLoading ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-secondary-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1.5 hover:bg-gray-800 rounded-full"
            aria-label="Limpiar búsqueda"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Suggestions Dropdown (Name Search Mode Only) */}
      <AnimatePresence>
        {searchMode === 'name' && showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute z-50 w-full mt-2 bg-gray-950 border-2 border-gray-800 rounded-[12px] shadow-2xl max-h-64 overflow-hidden"
          >
            <div className="overflow-y-auto max-h-64">
              {suggestions.map((product, index) => (
                <button
                  key={product._id}
                  type="button"
                  onClick={() => handleSelectProduct(product)}
                  className={`w-full px-4 py-3 text-left transition-all duration-150 hover:pl-5 ${
                    index === selectedIndex ? 'bg-secondary-gold bg-opacity-20 border-l-4 border-secondary-gold' : 'bg-gray-950 hover:bg-gray-800'
                  } ${index > 0 ? 'border-t border-gray-800' : ''}`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white truncate">
                        {highlightMatch(product.name, query)}
                      </div>
                      <div className="text-sm text-gray-400 truncate mt-0.5">
                        {highlightMatch(product.marca, query)} • {product.packageSize} {product.umd}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-bold text-secondary-gold text-base sm:text-lg">${product.price.toFixed(2)}</div>
                      {product.pum && (
                        <div className="text-xs text-gray-500 whitespace-nowrap">
                          ${product.pum.toFixed(2)}/{product.umd}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Results Message */}
      {searchMode === 'name' && showSuggestions && suggestions.length === 0 && query.trim().length >= 2 && !isLoading && (
        <div className="absolute z-50 w-full mt-2 bg-gray-950 border-2 border-gray-800 rounded-[12px] shadow-lg p-4 text-center">
          <p className="text-gray-400 text-sm">No se encontraron productos</p>
          <p className="text-gray-600 text-xs mt-1">Intenta con otro término de búsqueda</p>
        </div>
      )}
    </div>
  );
}

export default ProductSearchInput;
