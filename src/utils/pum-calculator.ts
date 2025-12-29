/**
 * Calcula el PUM (Precio por Unidad de Medida) para productos fruver
 * 
 * @param referencePrice Precio de referencia en COP
 * @param referenceWeight Peso de referencia en gramos
 * @returns PUM por gramo (redondeado a 2 decimales)
 * @throws Error si referenceWeight es 0 o valores son negativos
 * 
 * @example
 * calculatePUM(2500, 500) // Retorna 5 ($/g)
 * calculatePUM(10000, 1000) // Retorna 10 ($/g)
 */
export function calculatePUM(referencePrice: number, referenceWeight: number): number {
  if (referenceWeight === 0) {
    throw new Error('El peso de referencia no puede ser cero');
  }
  
  if (referencePrice < 0 || referenceWeight < 0) {
    throw new Error('El precio y el peso deben ser valores positivos');
  }
  
  const pum = referencePrice / referenceWeight;
  return Math.round(pum * 100) / 100;
}

/**
 * Calcula el precio total para un producto fruver
 * 
 * @param pum Precio por unidad de medida (por gramo)
 * @param quantity Cantidad en gramos
 * @returns Precio total en COP (redondeado al peso más cercano)
 * @throws Error si valores son negativos
 * 
 * @example
 * calculatePrice(5, 1000) // Retorna 5000
 * calculatePrice(7.5, 750) // Retorna 5625
 */
export function calculatePrice(pum: number, quantity: number): number {
  if (pum < 0 || quantity < 0) {
    throw new Error('El PUM y la cantidad deben ser valores positivos');
  }
  
  const total = pum * quantity;
  return Math.round(total);
}

/**
 * Formatea peso en gramos a formato legible
 * - Si es mayor o igual a 1000g, muestra en kg
 * - Si es menor a 1000g, muestra en gramos
 * 
 * @param grams Peso en gramos
 * @returns String formateado (ej: "1.50 kg" o "750 g")
 * 
 * @example
 * formatWeight(1000) // Retorna "1.00 kg"
 * formatWeight(750) // Retorna "750 g"
 * formatWeight(1500) // Retorna "1.50 kg"
 */
export function formatWeight(grams: number): string {
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(2)} kg`;
  }
  return `${grams} g`;
}

/**
 * Convierte kilogramos a gramos
 * 
 * @param kg Peso en kilogramos
 * @returns Peso en gramos
 * 
 * @example
 * kgToGrams(1.5) // Retorna 1500
 */
export function kgToGrams(kg: number): number {
  return kg * 1000;
}

/**
 * Convierte gramos a kilogramos
 * 
 * @param grams Peso en gramos
 * @returns Peso en kilogramos
 * 
 * @example
 * gramsToKg(1500) // Retorna 1.5
 */
export function gramsToKg(grams: number): number {
  return grams / 1000;
}

/**
 * Valida que un valor sea un peso válido (positivo y dentro de límites razonables)
 * 
 * @param grams Peso en gramos
 * @returns true si es válido, false si no
 */
export function isValidWeight(grams: number): boolean {
  return Number.isFinite(grams) && grams > 0 && grams <= 100_000; // Máximo 100kg
}


