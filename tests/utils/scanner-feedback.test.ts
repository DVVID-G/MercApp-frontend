/**
 * Tests for Scanner Feedback Utility (T033-T035)
 * Feature: 001-barcode-scanner-mobile
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  triggerVibration,
  getFrameColor,
  getFeedbackMessage,
  getFeedbackIcon,
  isVibrationSupported,
  getFrameClasses,
  getNextState
} from '../../src/utils/scanner-feedback';

describe('scanner-feedback utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // T033: triggerVibration with success pattern
  it('should trigger vibration with success pattern', () => {
    const mockVibrate = vi.fn();
    Object.defineProperty(navigator, 'vibrate', {
      value: mockVibrate,
      writable: true
    });

    triggerVibration('success');

    expect(mockVibrate).toHaveBeenCalledWith([50, 30, 50]);
  });

  it('should trigger vibration with error pattern', () => {
    const mockVibrate = vi.fn();
    Object.defineProperty(navigator, 'vibrate', {
      value: mockVibrate,
      writable: true
    });

    triggerVibration('error');

    expect(mockVibrate).toHaveBeenCalledWith([100]);
  });

  it('should trigger vibration with detecting pattern', () => {
    const mockVibrate = vi.fn();
    Object.defineProperty(navigator, 'vibrate', {
      value: mockVibrate,
      writable: true
    });

    triggerVibration('detecting');

    expect(mockVibrate).toHaveBeenCalledWith([20]);
  });

  // T034: triggerVibration gracefully fails when API unavailable
  it('should not throw when vibration API unavailable', () => {
    Object.defineProperty(navigator, 'vibrate', {
      value: undefined,
      writable: true
    });

    expect(() => triggerVibration('success')).not.toThrow();
  });

  // T035: getFrameColor returns correct color for each state
  it('should return correct color for idle state', () => {
    expect(getFrameColor('idle')).toBe('#3B82F6');
  });

  it('should return correct color for detecting state', () => {
    expect(getFrameColor('detecting')).toBe('#EAB308');
  });

  it('should return correct color for success state', () => {
    expect(getFrameColor('success')).toBe('#22C55E');
  });

  it('should return correct color for error state', () => {
    expect(getFrameColor('error')).toBe('#EF4444');
  });

  it('should return correct feedback messages', () => {
    expect(getFeedbackMessage('idle')).toContain('Posiciona');
    expect(getFeedbackMessage('detecting')).toContain('Detectando');
    expect(getFeedbackMessage('success')).toContain('leído');
    expect(getFeedbackMessage('error')).toContain('No se pudo');
  });

  it('should return correct icons for states', () => {
    expect(getFeedbackIcon('idle')).toBe('search');
    expect(getFeedbackIcon('detecting')).toBe('loader');
    expect(getFeedbackIcon('success')).toBe('check');
    expect(getFeedbackIcon('error')).toBe('error');
  });

  it('should detect vibration support', () => {
    Object.defineProperty(navigator, 'vibrate', {
      value: vi.fn(),
      writable: true
    });

    expect(isVibrationSupported()).toBe(true);
  });

  it('should return correct frame classes for states', () => {
    const idleClasses = getFrameClasses('idle');
    expect(idleClasses).toContain('border-scanner-idle');
    expect(idleClasses).toContain('animate-pulse');

    const detectingClasses = getFrameClasses('detecting');
    expect(detectingClasses).toContain('border-scanner-detecting');

    const successClasses = getFrameClasses('success');
    expect(successClasses).toContain('border-scanner-success');
    expect(successClasses).toContain('scale-105');

    const errorClasses = getFrameClasses('error');
    expect(errorClasses).toContain('border-scanner-error');
    expect(errorClasses).toContain('animate-shake');
  });

  it('should transition states correctly', () => {
    expect(getNextState('idle', 'code_detected')).toBe('detecting');
    expect(getNextState('detecting', 'code_validated')).toBe('success');
    expect(getNextState('detecting', 'code_failed')).toBe('error');
    expect(getNextState('success', 'reset')).toBe('idle');
    expect(getNextState('error', 'reset')).toBe('idle');
  });
});

