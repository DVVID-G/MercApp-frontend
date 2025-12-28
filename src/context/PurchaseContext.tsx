import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product } from '../App';

interface PurchaseItem extends Product {
  // Product already includes all needed fields
}

interface PurchaseContextType {
  draftProducts: PurchaseItem[];
  addProduct: (product: PurchaseItem) => void;
  removeProduct: (id: string) => void;
  updateProductQuantity: (id: string, quantity: number) => void;
  clearDraft: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  hasItems: boolean;
}

const PurchaseContext = createContext<PurchaseContextType | undefined>(undefined);

const STORAGE_KEY = 'mercapp_draft_purchase';

export const PurchaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [draftProducts, setDraftProducts] = useState<PurchaseItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Migrate old products without productType
          // If umd is 'g' or 'kg', it's likely a fruver product
          const migrated = parsed.map((p: PurchaseItem) => {
            if (!p.productType) {
              // Infer productType from umd - if it's 'g' or 'kg', it's fruver
              if (p.umd === 'g' || p.umd === 'kg') {
                return { ...p, productType: 'fruver' as const };
              }
              // Otherwise assume regular
              return { ...p, productType: 'regular' as const };
            }
            return p;
          });
          setDraftProducts(migrated);
        }
      } catch (e) {
        console.error('Error loading draft purchase:', e);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Save to localStorage whenever draftProducts changes
  useEffect(() => {
    if (draftProducts.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draftProducts));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [draftProducts]);

  const addProduct = useCallback((product: PurchaseItem) => {
    setDraftProducts((prev) => {
      // For fruver products, each addition is a separate unit (don't merge)
      // For regular products, merge by adding quantity
      if (product.productType === 'fruver') {
        // Fruver products should be separate entries - each counts as 1 unit
        // Add as new entry even if same product ID exists
        return [...prev, product];
      }
      
      // Regular products: check if product already exists and merge
      const existingIndex = prev.findIndex((p) => p.id === product.id && p.productType !== 'fruver');
      if (existingIndex >= 0) {
        // Update quantity if exists (only for regular products)
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + product.quantity,
          // Preserve productType
          productType: product.productType || updated[existingIndex].productType || 'regular',
        };
        return updated;
      }
      // Add new product
      return [...prev, product];
    });
  }, []);

  const removeProduct = useCallback((id: string) => {
    setDraftProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const updateProductQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      removeProduct(id);
      return;
    }
    setDraftProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, quantity } : p))
    );
  }, [removeProduct]);

  const clearDraft = useCallback(() => {
    setDraftProducts([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const getTotalItems = useCallback(() => {
    return draftProducts.reduce((sum, p) => {
      // Fruver products always count as 1 unit regardless of quantity (weight)
      // Regular products count by their quantity
      // Check productType explicitly - if it's fruver, count as 1
      if (p.productType === 'fruver') {
        return sum + 1;
      }
      // If productType is 'regular' or not set (backward compatibility), count by quantity
      // Regular products: sum their quantity
      return sum + (p.quantity || 1);
    }, 0);
  }, [draftProducts]);

  const getTotalPrice = useCallback(() => {
    return draftProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
  }, [draftProducts]);

  const hasItems = draftProducts.length > 0;

  return (
    <PurchaseContext.Provider
      value={{
        draftProducts,
        addProduct,
        removeProduct,
        updateProductQuantity,
        clearDraft,
        getTotalItems,
        getTotalPrice,
        hasItems,
      }}
    >
      {children}
    </PurchaseContext.Provider>
  );
};

export function usePurchase() {
  const context = useContext(PurchaseContext);
  if (!context) {
    throw new Error('usePurchase must be used within PurchaseProvider');
  }
  return context;
}

