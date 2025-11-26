import { api } from './api';

export async function createPurchase(payload: any) {
  const res = await api.post('/purchases', payload);
  return res.data;
}

export async function getPurchases(params?: Record<string, any>) {
  const res = await api.get('/purchases', { params });
  return res.data;
}

export async function getPurchaseById(id: string) {
  const res = await api.get(`/purchases/${id}`);
  return res.data;
}

export default { createPurchase, getPurchases, getPurchaseById };
