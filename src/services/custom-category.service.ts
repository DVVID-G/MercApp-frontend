import { api } from './api';

export interface CustomCategory {
  _id: string;
  userId: string;
  name: string;
  icon?: string;
  color?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryInput {
  name: string;
}

export interface UpdateCategoryInput {
  name?: string;
  order?: number;
  icon?: string;
  color?: string;
}

export async function getCategories(): Promise<{ categories: CustomCategory[] }> {
  const res = await api.get('/auth/categories');
  return res.data;
}

export async function createCategory(input: CreateCategoryInput): Promise<CustomCategory> {
  const res = await api.post('/auth/categories', input);
  return res.data;
}

export async function updateCategory(id: string, input: UpdateCategoryInput): Promise<CustomCategory> {
  const res = await api.put(`/auth/categories/${id}`, input);
  return res.data;
}

export async function deleteCategory(id: string): Promise<{ message: string; warning?: string }> {
  const res = await api.delete(`/auth/categories/${id}`);
  return res.data;
}

