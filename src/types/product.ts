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
 * Union discriminada de tipos de producto
 */
export type Product = ProductRegular | ProductFruver;

/**
 * Type guard para verificar si un producto es regular
 */
export function isProductRegular(product: Product): product is ProductRegular {
  return product.productType === 'regular';
}

/**
 * Type guard para verificar si un producto es fruver
 */
export function isProductFruver(product: Product): product is ProductFruver {
  return product.productType === 'fruver';
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

