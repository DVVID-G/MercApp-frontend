import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export const manualProductSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  marca: z.string().min(2, 'La marca es requerida'),
  price: z.number({ message: 'El precio debe ser un número' }).min(1, 'El precio debe ser mayor a 0'),
  packageSize: z.number({ message: 'El tamaño debe ser un número' }).min(1, 'El tamaño debe ser mayor a 0'),
  umd: z.string().min(1, 'La unidad de medida es requerida'),
  barcode: z.string().min(3, 'El código de barras es requerido'),
  categoria: z.string().min(1, 'La categoría es requerida'),
});

export type ManualProductFormData = z.infer<typeof manualProductSchema>;
