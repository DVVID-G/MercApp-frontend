/**
 * Scanner Feedback Utility
 * 
 * Functions for providing visual and haptic feedback during scanning
 * Feature: 001-barcode-scanner-mobile
 */

import type { ScannerVisualState, FeedbackType } from '../types/scanner.types';
import { VIBRATION_PATTERNS, SCANNER_COLORS } from '../types/scanner.types';

/**
 * Trigger vibration feedback if supported
 * @param type - Type of feedback (success, error, detecting)
 */
export function triggerVibration(type: FeedbackType): void {
  if (!('vibrate' in navigator)) {
    return; // Vibration API not supported
  }

  const pattern = VIBRATION_PATTERNS[type.toUpperCase() as keyof typeof VIBRATION_PATTERNS];
  if (pattern) {
    try {
      navigator.vibrate(pattern.pattern);
    } catch (error) {
      console.warn('Vibration failed:', error);
    }
  }
}

/**
 * Get frame color for a scanner state
 * @param state - Scanner visual state
 * @returns Hex color code
 */
export function getFrameColor(state: ScannerVisualState): string {
  return SCANNER_COLORS[state.toUpperCase() as keyof typeof SCANNER_COLORS] as string;
}

/**
 * Get contextual feedback message for a scanner state
 * @param state - Scanner visual state
 * @returns User-friendly message
 */
export function getFeedbackMessage(state: ScannerVisualState): string {
  const messages: Record<ScannerVisualState, string> = {
    idle: 'Posiciona el código en el recuadro',
    detecting: 'Detectando código...',
    success: '¡Código leído correctamente!',
    error: 'No se pudo leer el código'
  };

  return messages[state];
}

/**
 * Get icon name for a scanner state
 * @param state - Scanner visual state
 * @returns Icon identifier
 */
export function getFeedbackIcon(state: ScannerVisualState): 'search' | 'check' | 'error' | 'loader' {
  const icons: Record<ScannerVisualState, 'search' | 'check' | 'error' | 'loader'> = {
    idle: 'search',
    detecting: 'loader',
    success: 'check',
    error: 'error'
  };

  return icons[state];
}

/**
 * Check if vibration is supported
 * @returns true if Vibration API is available
 */
export function isVibrationSupported(): boolean {
  return 'vibrate' in navigator;
}

/**
 * Get CSS classes for frame based on state
 * @param state - Scanner visual state
 * @returns Tailwind CSS classes
 */
export function getFrameClasses(state: ScannerVisualState): string {
  const baseClasses = 'border-4 rounded-lg transition-all duration-200';
  
  const stateClasses: Record<ScannerVisualState, string> = {
    idle: 'border-scanner-idle animate-pulse',
    detecting: 'border-scanner-detecting',
    success: 'border-scanner-success scale-105',
    error: 'border-scanner-error animate-shake'
  };

  return `${baseClasses} ${stateClasses[state]}`;
}

/**
 * Determine next state based on scan progress
 * Useful for state machine transitions
 * @param currentState - Current scanner state
 * @param event - Event that occurred
 * @returns Next state
 */
export function getNextState(
  currentState: ScannerVisualState,
  event: 'code_detected' | 'code_validated' | 'code_failed' | 'reset'
): ScannerVisualState {
  const transitions: Record<ScannerVisualState, Partial<Record<string, ScannerVisualState>>> = {
    idle: {
      code_detected: 'detecting'
    },
    detecting: {
      code_validated: 'success',
      code_failed: 'error',
      reset: 'idle'
    },
    success: {
      reset: 'idle'
    },
    error: {
      reset: 'idle'
    }
  };

  return transitions[currentState][event] || currentState;
}

