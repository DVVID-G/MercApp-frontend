/**
 * Barcode Validation Utility
 * 
 * Functions for validating barcode format and confidence levels
 * Feature: 001-barcode-scanner-mobile
 */

import type { BarcodeFormat } from '../types/scanner.types';
import { CONFIDENCE_THRESHOLDS } from '../types/scanner.types';

/**
 * Validation patterns for different barcode formats
 */
const BARCODE_PATTERNS: Record<BarcodeFormat, RegExp> = {
  EAN_13: /^\d{13}$/,
  EAN_8: /^\d{8}$/,
  UPC_A: /^\d{12}$/,
  UPC_E: /^\d{6}$/,
  CODE_128: /^[\x00-\x7F]+$/,  // ASCII printable characters
  CODE_39: /^[A-Z0-9\-. $/+%]+$/
};

/**
 * Validate a barcode string against its format pattern
 * @param code - The barcode string to validate
 * @param format - The barcode format type
 * @returns true if the code matches the format pattern
 */
export function validateBarcode(code: string, format: BarcodeFormat): boolean {
  if (!code || code.trim() === '') {
    return false;
  }

  const pattern = BARCODE_PATTERNS[format];
  if (!pattern) {
    console.warn(`Unknown barcode format: ${format}`);
    return false;
  }

  return pattern.test(code);
}

/**
 * Determine if a detection should be accepted based on confidence level
 * @param confidence - Confidence score (0-100)
 * @returns true if confidence meets minimum threshold
 */
export function shouldAcceptDetection(confidence: number): boolean {
  return confidence >= CONFIDENCE_THRESHOLDS.MINIMUM;
}

/**
 * Get confidence level category (minimum/good/excellent)
 * @param confidence - Confidence score (0-100)
 * @returns Category string
 */
export function getConfidenceCategory(confidence: number): 'low' | 'minimum' | 'good' | 'excellent' {
  if (confidence < CONFIDENCE_THRESHOLDS.MINIMUM) {
    return 'low';
  } else if (confidence < CONFIDENCE_THRESHOLDS.GOOD) {
    return 'minimum';
  } else if (confidence < CONFIDENCE_THRESHOLDS.EXCELLENT) {
    return 'good';
  } else {
    return 'excellent';
  }
}

/**
 * Validate barcode format and confidence together
 * @param code - Barcode string
 * @param format - Barcode format
 * @param confidence - Confidence score
 * @returns Object with validation result and reason
 */
export function validateDetection(
  code: string,
  format: BarcodeFormat,
  confidence: number
): { valid: boolean; reason?: string } {
  // Check confidence first
  if (!shouldAcceptDetection(confidence)) {
    return {
      valid: false,
      reason: `Low confidence: ${confidence.toFixed(1)}% (minimum: ${CONFIDENCE_THRESHOLDS.MINIMUM}%)`
    };
  }

  // Check format
  if (!validateBarcode(code, format)) {
    return {
      valid: false,
      reason: `Invalid format: code "${code}" does not match ${format} pattern`
    };
  }

  return { valid: true };
}

/**
 * Sanitize barcode string (remove whitespace, convert to uppercase for CODE_39)
 * @param code - Raw barcode string
 * @param format - Barcode format
 * @returns Sanitized barcode string
 */
export function sanitizeBarcode(code: string, format: BarcodeFormat): string {
  let sanitized = code.trim();

  // CODE_39 should be uppercase
  if (format === 'CODE_39') {
    sanitized = sanitized.toUpperCase();
  }

  return sanitized;
}

/**
 * Get human-readable format name
 * @param format - Barcode format
 * @returns Human-readable name
 */
export function getFormatName(format: BarcodeFormat): string {
  const names: Record<BarcodeFormat, string> = {
    EAN_13: 'EAN-13',
    EAN_8: 'EAN-8',
    UPC_A: 'UPC-A',
    UPC_E: 'UPC-E',
    CODE_128: 'Code 128',
    CODE_39: 'Code 39'
  };

  return names[format] || format;
}

/**
 * Check if a format is numeric-only
 * @param format - Barcode format
 * @returns true if format only contains digits
 */
export function isNumericFormat(format: BarcodeFormat): boolean {
  return ['EAN_13', 'EAN_8', 'UPC_A', 'UPC_E'].includes(format);
}

/**
 * Estimate expected length for a format (useful for validation)
 * @param format - Barcode format
 * @returns Expected length or null if variable
 */
export function getExpectedLength(format: BarcodeFormat): number | null {
  const lengths: Partial<Record<BarcodeFormat, number>> = {
    EAN_13: 13,
    EAN_8: 8,
    UPC_A: 12,
    UPC_E: 6
  };

  return lengths[format] || null; // CODE_128 and CODE_39 are variable length
}

