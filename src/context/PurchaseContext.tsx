import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PurchaseItem, isPurchaseItemRegular, isPurchaseItemFruver } from '../types/product';

interface PurchaseContextType {
  draftProducts: PurchaseItem[];
  addProduct: (product: PurchaseItem) => void;
  removeProduct: (entryId: string) => void;
  updateProductQuantity: (entryId: string, quantity: number) => void;
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
          const migrated = parsed.map((p: any): PurchaseItem => {
            // Generate entryId for old items that don't have it
            const entryId = p.entryId || crypto.randomUUID();
            
            // Migrate old format to new PurchaseItem format
            if (!p.productType) {
              // Infer productType from umd - if it's 'g' or 'kg', it's fruver
              if (p.umd === 'g' || p.umd === 'kg') {
                return {
                  entryId,
                  id: p.id,
                  name: p.name,
                  marca: p.marca,
                  category: p.category || p.categoria,
                  umd: p.umd,
                  productType: 'fruver',
                  quantity: p.quantity || 1,
                  price: p.price || 0,
                  pum: p.pum,
                  packageSize: p.packageSize || 1,
                  barcode: p.barcode,
                };
              }
              // Otherwise assume regular
              return {
                entryId,
                id: p.id,
                name: p.name,
                marca: p.marca,
                category: p.category || p.categoria,
                umd: p.umd,
                productType: 'regular',
                quantity: p.quantity || 1,
                price: p.price || 0,
                pum: p.pum,
                packageSize: p.packageSize || 1,
                barcode: p.barcode || '',
              };
            }
            // Already has productType, ensure it matches PurchaseItem shape
            if (p.productType === 'fruver') {
              return {
                entryId,
                id: p.id,
                name: p.name,
                marca: p.marca,
                category: p.category || p.categoria,
                umd: p.umd,
                productType: 'fruver',
                quantity: p.quantity || 1,
                price: p.price || 0,
                pum: p.pum,
                packageSize: p.packageSize || 1,
                barcode: p.barcode,
              };
            } else {
              return {
                entryId,
                id: p.id,
                name: p.name,
                marca: p.marca,
                category: p.category || p.categoria,
                umd: p.umd,
                productType: 'regular',
                quantity: p.quantity || 1,
                price: p.price || 0,
                pum: p.pum,
                packageSize: p.packageSize || 1,
                barcode: p.barcode || '',
              };
            }
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
      // Generate unique entryId if not provided
      const productWithEntryId: PurchaseItem = product.entryId 
        ? product 
        : isPurchaseItemRegular(product)
        ? { ...product, entryId: crypto.randomUUID() }
        : { ...product, entryId: crypto.randomUUID() };
      
      // For fruver products, each addition is a separate unit (don't merge)
      // For regular products, merge by adding quantity
      if (isPurchaseItemFruver(productWithEntryId)) {
        // Fruver products should be separate entries - each counts as 1 unit
        // Add as new entry even if same product ID exists
        return [...prev, productWithEntryId];
      }
      
      // Regular products: check if product already exists and merge
      const existingIndex = prev.findIndex((p) => p.id === productWithEntryId.id && isPurchaseItemRegular(p));
      if (existingIndex >= 0) {
        // Update quantity if exists (only for regular products)
        const updated = [...prev];
        const existing = updated[existingIndex];
        if (isPurchaseItemRegular(existing) && isPurchaseItemRegular(productWithEntryId)) {
          updated[existingIndex] = {
            ...existing,
            quantity: existing.quantity + productWithEntryId.quantity,
          };
        }
        return updated;
      }
      // Add new product
      return [...prev, productWithEntryId];
    });
  }, []);

  const removeProduct = useCallback((entryId: string) => {
    setDraftProducts((prev) => prev.filter((p) => p.entryId !== entryId));
  }, []);

  const updateProductQuantity = useCallback((entryId: string, quantity: number) => {
    if (quantity <= 0) {
      removeProduct(entryId);
      return;
    }
    setDraftProducts((prev) =>
      prev.map((p) => (p.entryId === entryId ? { ...p, quantity } : p))
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
      if (isPurchaseItemFruver(p)) {
        return sum + 1;
      }
      // Regular products: sum their quantity
      return sum + p.quantity;
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

