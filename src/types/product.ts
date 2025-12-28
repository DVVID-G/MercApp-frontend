/**
 * Tipo de producto: regular (con código de barras) o fruver (peso variable)
 */
export type ProductType = 'regular' | 'fruver';

/**
 * Interface base para propiedades comunes de productos
 */
export interface ProductBase {
  _id: string;
  name: string;
  marca: string;
  categoria: string;
  umd: string;
  productType: ProductType;
  pum?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Producto regular con precio fijo y código de barras
 */
export interface ProductRegular extends ProductBase {
  productType: 'regular';
  barcode: string;
  price: number;
  packageSize: number;
}

/**
 * Producto fruver con peso variable
 */
export interface ProductFruver extends ProductBase {
  productType: 'fruver';
  barcode?: string;
  referencePrice: number;
  referenceWeight: number;
  pum: number; // Calculado automáticamente
  umd: 'g' | 'kg'; // Solo gramos o kilogramos
}

/**
 * Union discriminada de tipos de producto del catálogo
 */
export type CatalogProduct = ProductRegular | ProductFruver;

/**
 * Type guard para verificar si un producto del catálogo es regular
 */
export function isProductRegular(product: CatalogProduct): product is ProductRegular {
  return product.productType === 'regular';
}

/**
 * Type guard para verificar si un producto del catálogo es fruver
 */
export function isProductFruver(product: CatalogProduct): product is ProductFruver {
  return product.productType === 'fruver';
}

/**
 * Producto para UI/checkout - versión simplificada para compras
 * Incluye campos necesarios para la interfaz de usuario y checkout
 */
export interface PurchaseProduct {
  id: string;
  barcode: string;
  name: string;
  marca: string;
  category: string;
  price: number;
  quantity: number;
  packageSize: number;
  pum?: number;
  umd: string;
  productType: ProductType;
}

/**
 * Request para crear producto regular
 */
export interface CreateProductRegularRequest {
  name: string;
  marca: string;
  categoria: string;
  barcode: string;
  price: number;
  packageSize: number;
  umd: string;
  productType: 'regular';
}

/**
 * Request para crear producto fruver
 */
export interface CreateProductFruverRequest {
  name: string;
  marca: string;
  categoria: string;
  barcode?: string;
  referencePrice: number;
  referenceWeight: number;
  umd: 'g' | 'kg';
  productType: 'fruver';
}

/**
 * Union discriminada para crear productos
 */
export type CreateProductRequest = CreateProductRegularRequest | CreateProductFruverRequest;

/**
 * Base para items de compra (PurchaseItem)
 * Adapta Product para uso en compras con id, category, quantity y price unitario
 */
interface PurchaseItemBase {
  entryId: string; // Identificador único para cada entrada (permite múltiples instancias del mismo producto)
  id: string; // Usa id en lugar de _id
  name: string;
  marca: string;
  category: string; // Usa category en lugar de categoria
  umd: string;
  productType: ProductType;
  quantity: number; // Cantidad agregada
  price: number; // Precio unitario (no el precio del catálogo)
  pum?: number;
  packageSize: number; // Para regular: packageSize, para fruver: referenceWeight
}

/**
 * Item de compra para producto regular
 */
export interface PurchaseItemRegular extends PurchaseItemBase {
  productType: 'regular';
  barcode: string; // Requerido para regular
}

/**
 * Item de compra para producto fruver
 */
export interface PurchaseItemFruver extends PurchaseItemBase {
  productType: 'fruver';
  barcode?: string; // Opcional para fruver
}

/**
 * Union discriminada para items de compra
 */
export type PurchaseItem = PurchaseItemRegular | PurchaseItemFruver;

/**
 * Type guard para verificar si un PurchaseItem es regular
 */
export function isPurchaseItemRegular(item: PurchaseItem): item is PurchaseItemRegular {
  return item.productType === 'regular';
}

/**
 * Type guard para verificar si un PurchaseItem es fruver
 */
export function isPurchaseItemFruver(item: PurchaseItem): item is PurchaseItemFruver {
  return item.productType === 'fruver';
}

/**
 * Convierte un CatalogProduct a PurchaseProduct para uso en UI/checkout
 */
export function catalogProductToPurchaseProduct(
  catalogProduct: CatalogProduct,
  quantity: number = 1
): PurchaseProduct {
  const unitPrice = isProductRegular(catalogProduct)
    ? catalogProduct.price
    : isProductFruver(catalogProduct)
    ? (catalogProduct.pum || 0)
    : 0;

  return {
    id: catalogProduct._id,
    barcode: isProductRegular(catalogProduct)
      ? catalogProduct.barcode
      : catalogProduct.barcode || '',
    name: catalogProduct.name,
    marca: catalogProduct.marca,
    category: catalogProduct.categoria,
    price: unitPrice,
    quantity,
    packageSize: isProductRegular(catalogProduct)
      ? catalogProduct.packageSize
      : isProductFruver(catalogProduct)
      ? catalogProduct.referenceWeight
      : 1,
    pum: catalogProduct.pum,
    umd: catalogProduct.umd,
    productType: catalogProduct.productType,
  };
}

