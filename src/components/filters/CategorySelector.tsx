import React, { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CATEGORIES, CATEGORY_LABELS, type ProductCategory } from '../../types/productFilters';

interface CategorySelectorProps {
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategories,
  onCategoriesChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const selectedCount = selectedCategories.length;

  const handleToggle = (category: string) => {
    const isSelected = selectedCategories.includes(category);
    if (isSelected) {
      onCategoriesChange(selectedCategories.filter(c => c !== category));
    } else {
      onCategoriesChange([...selectedCategories, category]);
    }
  };

  return (
    <div className="space-y-2" role="group" aria-labelledby="category-selector-title">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-3"
        aria-expanded={isExpanded}
        aria-controls="category-list"
        id="category-selector-title"
      >
        <h3 className="text-sm font-medium text-gray-300">
          Categorías
          {selectedCount > 0 && (
            <span className="ml-2 text-xs text-secondary-gold">
              ({selectedCount} {selectedCount === 1 ? 'seleccionada' : 'seleccionadas'})
            </span>
          )}
        </h3>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isExpanded ? 'transform rotate-180' : ''
          }`}
        />
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            id="category-list"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {CATEGORIES.map((category) => {
                const isSelected = selectedCategories.includes(category);
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleToggle(category)}
                    role="checkbox"
                    aria-checked={isSelected}
                    aria-label={CATEGORY_LABELS[category]}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-[12px] transition-colors ${
                      isSelected
                        ? 'bg-secondary-gold/20 border-2 border-secondary-gold'
                        : 'bg-gray-950 border-2 border-gray-800 hover:bg-gray-800'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      isSelected
                        ? 'bg-secondary-gold border-secondary-gold'
                        : 'border-gray-700'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-gray-950" />}
                    </div>
                    <span className="text-sm text-gray-300 font-medium">
                      {CATEGORY_LABELS[category]}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


