/**
 * Formatea un número como moneda colombiana (COP)
 * 
 * @param amount Monto en COP
 * @returns String formateado con símbolo $ y separador de miles (ej: "$2.500")
 * 
 * @example
 * formatCOP(2500) // Retorna "$2.500"
 * formatCOP(15000) // Retorna "$15.000"
 * formatCOP(1250000) // Retorna "$1.250.000"
 */
export function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Parsea un string con formato COP a número
 * Remueve todos los caracteres no numéricos
 * 
 * @param value String con formato COP (ej: "$2.500" o "2.500" o "2500")
 * @returns Número parseado (ej: 2500)
 * 
 * @example
 * parseCOPInput("$2.500") // Retorna 2500
 * parseCOPInput("15.000") // Retorna 15000
 * parseCOPInput("abc123def") // Retorna 123
 */
export function parseCOPInput(value: string): number {
  const cleaned = value.replace(/[^0-9]/g, '');
  return parseInt(cleaned, 10) || 0;
}

/**
 * Valida que un valor sea un monto válido en COP
 * 
 * @param value Monto a validar
 * @returns true si es válido, false si no
 * 
 * @example
 * isValidCOPAmount(2500) // Retorna true
 * isValidCOPAmount(-100) // Retorna false
 * isValidCOPAmount(Infinity) // Retorna false
 */
export function isValidCOPAmount(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 1_000_000_000; // Máximo $1B COP
}

/**
 * Formatea un PUM (Precio por Unidad de Medida) con su unidad
 * 
 * @param pum Precio por unidad de medida
 * @param umd Unidad de medida (ej: "g", "kg")
 * @returns String formateado (ej: "$5/g" o "$5.000/kg")
 * 
 * @example
 * formatPUM(5, 'g') // Retorna "$5/g"
 * formatPUM(5000, 'kg') // Retorna "$5.000/kg"
 */
export function formatPUM(pum: number, umd: string): string {
  return `${formatCOP(pum)}/${umd}`;
}


