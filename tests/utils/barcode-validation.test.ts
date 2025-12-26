/**
 * Tests for Barcode Validation Utility
 * Feature: 001-barcode-scanner-mobile
 */

import { describe, it, expect } from 'vitest';
import {
  validateBarcode,
  shouldAcceptDetection,
  getConfidenceCategory,
  validateDetection,
  sanitizeBarcode,
  getFormatName,
  isNumericFormat,
  getExpectedLength
} from '../../src/utils/barcode-validation';

describe('barcode-validation utilities', () => {
  describe('validateBarcode', () => {
    it('should validate EAN-13 format correctly', () => {
      expect(validateBarcode('1234567890123', 'EAN_13')).toBe(true);
      expect(validateBarcode('123456789012', 'EAN_13')).toBe(false); // Too short
      expect(validateBarcode('12345678901234', 'EAN_13')).toBe(false); // Too long
      expect(validateBarcode('12345678901A3', 'EAN_13')).toBe(false); // Contains letter
    });

    it('should validate EAN-8 format correctly', () => {
      expect(validateBarcode('12345678', 'EAN_8')).toBe(true);
      expect(validateBarcode('1234567', 'EAN_8')).toBe(false);
      expect(validateBarcode('123456789', 'EAN_8')).toBe(false);
    });

    it('should validate UPC-A format correctly', () => {
      expect(validateBarcode('123456789012', 'UPC_A')).toBe(true);
      expect(validateBarcode('12345678901', 'UPC_A')).toBe(false);
    });

    it('should validate UPC-E format correctly', () => {
      expect(validateBarcode('123456', 'UPC_E')).toBe(true);
      expect(validateBarcode('12345', 'UPC_E')).toBe(false);
    });

    it('should validate CODE_128 format correctly', () => {
      expect(validateBarcode('ABC123', 'CODE_128')).toBe(true);
      expect(validateBarcode('Test-123', 'CODE_128')).toBe(true);
      // CODE_128 allows any ASCII printable
      expect(validateBarcode('!@#$%^', 'CODE_128')).toBe(true);
    });

    it('should validate CODE_39 format correctly', () => {
      expect(validateBarcode('ABC-123', 'CODE_39')).toBe(true);
      expect(validateBarcode('TEST 123', 'CODE_39')).toBe(true);
      expect(validateBarcode('12.34+56', 'CODE_39')).toBe(true);
      // CODE_39 doesn't allow lowercase
      expect(validateBarcode('abc', 'CODE_39')).toBe(false);
    });

    it('should reject empty or whitespace-only codes', () => {
      expect(validateBarcode('', 'EAN_13')).toBe(false);
      expect(validateBarcode('   ', 'EAN_13')).toBe(false);
    });
  });

  describe('shouldAcceptDetection', () => {
    it('should accept confidence above minimum threshold (75%)', () => {
      expect(shouldAcceptDetection(75)).toBe(true);
      expect(shouldAcceptDetection(80)).toBe(true);
      expect(shouldAcceptDetection(100)).toBe(true);
    });

    it('should reject confidence below minimum threshold', () => {
      expect(shouldAcceptDetection(74.9)).toBe(false);
      expect(shouldAcceptDetection(50)).toBe(false);
      expect(shouldAcceptDetection(0)).toBe(false);
    });
  });

  describe('getConfidenceCategory', () => {
    it('should categorize confidence levels correctly', () => {
      expect(getConfidenceCategory(50)).toBe('low');
      expect(getConfidenceCategory(75)).toBe('minimum');
      expect(getConfidenceCategory(85)).toBe('good');
      expect(getConfidenceCategory(95)).toBe('excellent');
    });

    it('should handle boundary cases', () => {
      expect(getConfidenceCategory(74.9)).toBe('low');
      expect(getConfidenceCategory(84.9)).toBe('minimum');
      expect(getConfidenceCategory(94.9)).toBe('good');
      expect(getConfidenceCategory(100)).toBe('excellent');
    });
  });

  describe('validateDetection', () => {
    it('should validate detection with good confidence and valid format', () => {
      const result = validateDetection('1234567890123', 'EAN_13', 85);
      
      expect(result.valid).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should reject detection with low confidence', () => {
      const result = validateDetection('1234567890123', 'EAN_13', 50);
      
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Low confidence');
      expect(result.reason).toContain('50.0%');
    });

    it('should reject detection with invalid format', () => {
      const result = validateDetection('123', 'EAN_13', 90);
      
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Invalid format');
      expect(result.reason).toContain('123');
    });

    it('should pass minimum confidence threshold', () => {
      const result = validateDetection('1234567890123', 'EAN_13', 75);
      
      expect(result.valid).toBe(true);
    });
  });

  describe('sanitizeBarcode', () => {
    it('should trim whitespace', () => {
      expect(sanitizeBarcode('  12345  ', 'EAN_8')).toBe('12345');
      expect(sanitizeBarcode('\n12345\t', 'EAN_8')).toBe('12345');
    });

    it('should convert CODE_39 to uppercase', () => {
      expect(sanitizeBarcode('abc123', 'CODE_39')).toBe('ABC123');
      expect(sanitizeBarcode('Test-Code', 'CODE_39')).toBe('TEST-CODE');
    });

    it('should not modify other formats', () => {
      expect(sanitizeBarcode('123456', 'EAN_8')).toBe('123456');
      expect(sanitizeBarcode('ABC123', 'CODE_128')).toBe('ABC123');
    });
  });

  describe('getFormatName', () => {
    it('should return human-readable format names', () => {
      expect(getFormatName('EAN_13')).toBe('EAN-13');
      expect(getFormatName('EAN_8')).toBe('EAN-8');
      expect(getFormatName('UPC_A')).toBe('UPC-A');
      expect(getFormatName('UPC_E')).toBe('UPC-E');
      expect(getFormatName('CODE_128')).toBe('Code 128');
      expect(getFormatName('CODE_39')).toBe('Code 39');
    });
  });

  describe('isNumericFormat', () => {
    it('should identify numeric formats', () => {
      expect(isNumericFormat('EAN_13')).toBe(true);
      expect(isNumericFormat('EAN_8')).toBe(true);
      expect(isNumericFormat('UPC_A')).toBe(true);
      expect(isNumericFormat('UPC_E')).toBe(true);
    });

    it('should identify non-numeric formats', () => {
      expect(isNumericFormat('CODE_128')).toBe(false);
      expect(isNumericFormat('CODE_39')).toBe(false);
    });
  });

  describe('getExpectedLength', () => {
    it('should return correct length for fixed-length formats', () => {
      expect(getExpectedLength('EAN_13')).toBe(13);
      expect(getExpectedLength('EAN_8')).toBe(8);
      expect(getExpectedLength('UPC_A')).toBe(12);
      expect(getExpectedLength('UPC_E')).toBe(6);
    });

    it('should return null for variable-length formats', () => {
      expect(getExpectedLength('CODE_128')).toBe(null);
      expect(getExpectedLength('CODE_39')).toBe(null);
    });
  });
});

