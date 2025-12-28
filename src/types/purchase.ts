import { ProductType } from './product';

/**
 * Item de compra con información del producto
 */
export interface PurchaseItem {
  productId?: string;
  name: string;
  marca: string;
  categoria: string;
  umd: string;
  productType: ProductType;
  quantity: number; // Unidades (regular) o gramos (fruver)
  price: number; // Precio total del item
  pum?: number; // PUM para referencia
  barcode?: string; // Solo para regular
  packageSize?: number; // Solo para regular
}

/**
 * Compra completa
 */
export interface Purchase {
  _id: string;
  userId: string;
  items: PurchaseItem[];
  total: number;
  createdAt: string;
}

/**
 * Type guard para verificar si un item es regular
 */
export function isPurchaseItemRegular(item: PurchaseItem): boolean {
  return item.productType === 'regular';
}

/**
 * Type guard para verificar si un item es fruver
 */
export function isPurchaseItemFruver(item: PurchaseItem): boolean {
  return item.productType === 'fruver';
}

