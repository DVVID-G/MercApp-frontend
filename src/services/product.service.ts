import api from './api';
import { Product, CreateProductRequest } from '../types/product';

export interface UpdateProductData {
  name?: string;
  marca?: string;
  price?: number;
  packageSize?: number;
  umd?: string;
  barcode?: string;
  categoria?: string;
  referencePrice?: number;
  referenceWeight?: number;
}

export interface SearchProductsParams {
  q: string;
  limit?: number;
}

/**
 * Busca productos por nombre usando búsqueda de texto
 */
export async function searchProducts(params: SearchProductsParams): Promise<Product[]> {
  const response = await api.get<Product[]>('/products/search', { params });
  return response.data;
}

/**
 * Busca un producto por código de barras
 */
export async function getProductByBarcode(barcode: string): Promise<Product | null> {
  try {
    const response = await api.get<Product>(`/products/barcode/${barcode}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Crea un nuevo producto (regular o fruver)
 */
export async function createProduct(data: CreateProductRequest): Promise<Product> {
  const response = await api.post<Product>('/products', data);
  return response.data;
}

/**
 * Actualiza un producto existente
 */
export async function updateProduct(id: string, data: UpdateProductData): Promise<Product> {
  const response = await api.put<Product>(`/products/${id}`, data);
  return response.data;
}

/**
 * Lista todos los productos
 */
export async function listProducts(): Promise<Product[]> {
  const response = await api.get<Product[]>('/products');
  return response.data;
}

export default {
  searchProducts,
  getProductByBarcode,
  createProduct,
  updateProduct,
  listProducts,
};
