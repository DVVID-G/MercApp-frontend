import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Filter, Search, X } from 'lucide-react';
import { searchProducts, getProductByBarcode } from '../services/product.service';
import { ProductFiltersProvider, useProductFilters } from '../hooks/useProductFilters';
import { useFilteredProducts } from '../hooks/useFilteredProducts';
import { ProductFilterPanel } from './filters/ProductFilterPanel';
import { ProductFilterSummary } from './filters/ProductFilterSummary';
import { generateFilterTags } from '../utils/productFilterTags';
import { getActiveFilterCount } from '../types/productFilters';
import { CatalogProduct, isProductRegular, isProductFruver } from '../types/product';

export type SearchMode = 'barcode' | 'name';

export interface ProductSearchInputProps {
  onProductSelect: (product: CatalogProduct) => void;
  onNoResults?: () => void;
  placeholder?: string;
  mode?: SearchMode;
  autoFocus?: boolean;
  hideModeToggle?: boolean; // Hide the barcode/name toggle
  compact?: boolean; // Compact layout for modals
}

function ProductSearchInputInner({
  onProductSelect,
  onNoResults,
  placeholder = 'Buscar producto...',
  mode: initialMode = 'barcode',
  autoFocus = false,
  hideModeToggle = false,
  compact = false,
}: ProductSearchInputProps) {
  const [searchMode, setSearchMode] = useState<SearchMode>(initialMode);
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // Query used for actual search
  const [allSuggestions, setAllSuggestions] = useState<CatalogProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Filter hooks
  const { state: filters, dispatch } = useProductFilters();
  const suggestions = useFilteredProducts(allSuggestions, filters);
  const filterTags = generateFilterTags(filters, dispatch);
  const activeFilterCount = getActiveFilterCount(filters);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Perform search when searchQuery changes (triggered by button or Enter)
  useEffect(() => {
    if (searchMode === 'name' && searchQuery.trim().length >= 1) {
      // Perform search inline to avoid dependency issues
      const searchTerm = searchQuery.trim();
      setIsLoading(true);
      searchProducts({ q: searchTerm, limit: 100 })
        .then((results) => {
          setAllSuggestions(results);
          setShowSuggestions(true);
          setSelectedIndex(-1);
        })
        .catch((error) => {
          console.error('Error searching products:', error);
          setAllSuggestions([]);
          setShowSuggestions(false);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else if (searchMode === 'name' && searchQuery === '') {
      // Clear results if search query is empty
      setAllSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, searchMode]);

  const handleSearch = () => {
    if (query.trim().length >= 1) {
      setSearchQuery(query.trim());
    }
  };

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
      if (e.key === 'Enter') {
        e.preventDefault();
        // If there's a selected suggestion, select it
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelectProduct(suggestions[selectedIndex]);
        } else {
          // Otherwise, perform search
          handleSearch();
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (showSuggestions && suggestions.length > 0) {
          setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, -1));
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    }
  };

  const handleSelectProduct = (product: CatalogProduct) => {
    onProductSelect(product);
    setQuery('');
    setAllSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const toggleSearchMode = () => {
    setSearchMode((prev) => (prev === 'barcode' ? 'name' : 'barcode'));
    setQuery('');
    setAllSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const clearSearch = () => {
    setQuery('');
    setSearchQuery('');
    setAllSuggestions([]);
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
    <div className="relative w-full" style={{ isolation: 'isolate' }}>
      {/* Filter Summary - Show when filters are active and in name search mode */}
      {searchMode === 'name' && filterTags.length > 0 && (
        <ProductFilterSummary
          tags={filterTags}
          totalResults={suggestions.length}
          totalProducts={allSuggestions.length}
          onClearAll={() => dispatch({ type: 'reset' })}
          isLoading={isLoading}
        />
      )}

      {/* Search Mode Toggle - Hidden if hideModeToggle is true */}
      {!hideModeToggle && (
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
      )}

      {/* Search Input - Full Width */}
      <div className="mb-3">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              searchMode === 'barcode' ? 'Escanea o ingresa código de barras' : placeholder
            }
            className="w-full px-4 py-3 pr-12 bg-gray-950 text-white border-2 border-gray-800 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-secondary-gold focus:border-secondary-gold placeholder:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed [&::-webkit-search-cancel-button]:hidden [&::-ms-clear]:hidden"
            disabled={isLoading}
            aria-label={searchMode === 'barcode' ? 'Código de barras' : 'Buscar producto por nombre'}
            aria-describedby={searchMode === 'name' ? 'search-hint' : undefined}
            style={{ paddingRight: query && !isLoading ? '2.75rem' : '1rem' }}
          />
          
          {/* Clear Button (inside input, only when there's text and not loading) */}
          {query && !isLoading && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-all duration-200 p-1 hover:bg-gray-800 rounded-[6px] z-10 flex items-center justify-center"
              aria-label="Limpiar búsqueda"
              onMouseDown={(e) => e.preventDefault()}
              style={{ right: '0.75rem' }}
            >
              <X className="w-4 h-4" strokeWidth={2.5} />
            </button>
          )}
          
          {/* Loading Indicator */}
          {isLoading && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-secondary-gold border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons Row (Name Mode Only) */}
      {searchMode === 'name' && (
        <div className="flex gap-2 mb-3">
          {/* Search Button */}
          <motion.button
            type="button"
            onClick={handleSearch}
            disabled={isLoading || !query.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 px-4 py-3 bg-secondary-gold text-primary-black rounded-[12px] font-semibold hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            aria-label="Buscar productos"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-black border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Buscando...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span className="text-sm font-semibold">Buscar</span>
              </>
            )}
          </motion.button>

          {/* Filter Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              
              const button = e.currentTarget;
              button.blur();
              
              requestAnimationFrame(() => {
                setIsFilterPanelOpen(true);
              });
            }}
            className="px-4 py-3 rounded-[12px] border-2 border-gray-800 hover:border-secondary-gold transition-colors flex items-center justify-center gap-2 bg-gray-950 flex-shrink-0"
            aria-label="Abrir filtros de búsqueda"
          >
            <Filter className="w-5 h-5" />
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-secondary-gold text-gray-950 text-xs font-semibold min-w-[20px] text-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Search Hint (Name Mode Only) */}
      {searchMode === 'name' && !showSuggestions && (
        <p id="search-hint" className="text-xs text-gray-500 mt-2 mb-2">
          Escribe el nombre del producto y presiona "Buscar" o Enter
        </p>
      )}

      {/* Suggestions Dropdown (Name Search Mode Only) */}
      <AnimatePresence>
        {searchMode === 'name' && showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full mt-3 bg-gray-950 border-2 border-gray-800 rounded-[12px] shadow-2xl overflow-hidden"
            style={{
              maxHeight: compact ? '50vh' : '60vh',
            }}
          >
            {/* Results count header - sticky */}
            <div className="sticky top-0 z-10 px-4 py-3 bg-gray-900 border-b-2 border-gray-800">
              <p className="text-sm text-gray-300 font-semibold">
                {suggestions.length} {suggestions.length === 1 ? 'producto encontrado' : 'productos encontrados'}
              </p>
            </div>
            
            {/* Scrollable results list */}
            <div 
              className="overflow-y-auto"
              role="listbox"
              aria-label="Resultados de búsqueda"
            style={{
              maxHeight: compact ? 'calc(50vh - 45px)' : 'calc(60vh - 45px)',
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain',
              scrollPaddingTop: '4px',
              scrollPaddingBottom: '4px',
            }}
          >
              {suggestions.map((product, index) => (
                <button
                  key={product._id}
                  type="button"
                  onClick={() => handleSelectProduct(product)}
                  role="option"
                  aria-selected={index === selectedIndex}
                  className={`w-full px-4 py-4 text-left transition-all duration-150 ${
                    index === selectedIndex 
                      ? 'bg-secondary-gold bg-opacity-15 border-l-4 border-secondary-gold' 
                      : 'bg-gray-950 hover:bg-gray-900 active:bg-gray-900'
                  } ${index > 0 ? 'border-t border-gray-800' : ''} focus:outline-none focus:ring-2 focus:ring-secondary-gold focus:ring-offset-2 focus:ring-offset-gray-950`}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onFocus={() => setSelectedIndex(index)}
                >
                  <div className="flex justify-between items-start gap-4">
                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      {/* Product Name - Primary Text */}
                      <div className="font-semibold text-white text-base mb-2.5 leading-snug break-words">
                        {highlightMatch(product.name, searchQuery || query)}
                      </div>
                      
                      {/* Secondary Info - Better Contrast */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm text-gray-300 font-medium truncate max-w-[140px]">
                            {highlightMatch(product.marca, searchQuery || query)}
                          </span>
                          <span className="text-gray-600 text-sm" aria-hidden="true">•</span>
                          <span className="text-sm text-gray-300 whitespace-nowrap">
                            {isProductRegular(product) 
                              ? `${product.packageSize} ${product.umd}`
                              : isProductFruver(product)
                              ? `${product.referenceWeight}g`
                              : `${product.umd}`
                            }
                          </span>
                        </div>
                        
                        {/* Category Badge - Better Contrast */}
                        {product.categoria && (
                          <div>
                            <span className="inline-block px-2.5 py-1 bg-gray-800 border border-gray-700 rounded-[6px] text-xs font-medium text-gray-200">
                              {product.categoria}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Price Info - Right Aligned */}
                    <div className="text-right flex-shrink-0 ml-2 min-w-[90px]">
                      {isProductRegular(product) ? (
                        <>
                          {/* Main Price - High Contrast */}
                          <div className="font-bold text-secondary-gold text-lg leading-tight whitespace-nowrap mb-1">
                            ${product.price.toFixed(2)}
                          </div>
                          {/* PUM - Better Contrast */}
                          {product.pum && (
                            <div className="text-xs text-gray-300 whitespace-nowrap font-medium">
                              ${product.pum.toFixed(2)}/{product.umd}
                            </div>
                          )}
                        </>
                      ) : isProductFruver(product) ? (
                        <>
                          {/* Reference Price - High Contrast */}
                          <div className="font-bold text-secondary-gold text-lg leading-tight whitespace-nowrap mb-1">
                            ${product.referencePrice.toFixed(2)}
                          </div>
                          {/* PUM - Better Contrast */}
                          {product.pum && (
                            <div className="text-xs text-gray-300 whitespace-nowrap font-medium">
                              ${product.pum.toFixed(2)}/g
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="font-bold text-secondary-gold text-lg">$0.00</div>
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
      {searchMode === 'name' && showSuggestions && suggestions.length === 0 && searchQuery.trim().length >= 1 && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="relative w-full mt-3 bg-gray-950 border-2 border-gray-800 rounded-[12px] shadow-lg p-6 text-center"
        >
          <div className="text-4xl mb-4" aria-hidden="true">🔍</div>
          <h3 className="text-white text-lg font-semibold mb-2">
            {allSuggestions.length === 0 
              ? 'No se encontraron productos'
              : 'No hay productos que coincidan con los filtros'}
          </h3>
          <p className="text-gray-300 text-sm mb-5 leading-relaxed">
            {allSuggestions.length === 0
              ? `No hay resultados para "${searchQuery || query}". Intenta con otro término de búsqueda.`
              : 'Ajusta los filtros o intenta con otro término de búsqueda'}
          </p>
          {allSuggestions.length > 0 && (
            <button
              onClick={() => dispatch({ type: 'reset' })}
              className="px-5 py-2.5 rounded-[8px] bg-gray-900 border-2 border-gray-700 text-white hover:bg-gray-800 hover:border-secondary-gold focus:outline-none focus:ring-2 focus:ring-secondary-gold focus:ring-offset-2 focus:ring-offset-gray-950 transition-all text-sm font-semibold"
            >
              Limpiar filtros
            </button>
          )}
          {allSuggestions.length === 0 && (
            <button
              onClick={() => {
                clearSearch();
              }}
              className="px-5 py-2.5 rounded-[8px] bg-gray-900 border-2 border-gray-700 text-white hover:bg-gray-800 hover:border-secondary-gold focus:outline-none focus:ring-2 focus:ring-secondary-gold focus:ring-offset-2 focus:ring-offset-gray-950 transition-all text-sm font-semibold"
            >
              Limpiar búsqueda
            </button>
          )}
        </motion.div>
      )}

      {/* Filter Panel - Always render, but only show when open */}
      {/* Render outside the relative container to avoid modal conflicts */}
      {searchMode === 'name' && (
        <ProductFilterPanel
          isOpen={isFilterPanelOpen}
          onClose={() => {
            console.log('[ProductSearchInput] Closing filter panel');
            setIsFilterPanelOpen(false);
          }}
        />
      )}
    </div>
  );
}

export function ProductSearchInput(props: ProductSearchInputProps) {
  return (
    <ProductFiltersProvider>
      <ProductSearchInputInner {...props} />
    </ProductFiltersProvider>
  );
}

export default ProductSearchInput;
