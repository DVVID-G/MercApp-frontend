/**
 * Color Utilities for MercApp Color System
 * 
 * Provides utilities for color validation, contrast checking, and handling
 * elements with multiple semantic colors.
 */

/**
 * Color values from the MercApp palette
 */
export const COLOR_VALUES = {
  PRIMARY_MINT: '#00C896',
  PRIMARY_MINT_50: '#E6F9F4',
  PRIMARY_MINT_100: '#B3F0E0',
  PRIMARY_MINT_200: '#80E7CC',
  PRIMARY_MINT_300: '#4DDEB8',
  PRIMARY_MINT_400: '#1AD5A4',
  PRIMARY_MINT_500: '#00C896',
  PRIMARY_MINT_600: '#00B386',
  PRIMARY_MINT_700: '#00B585',
  PRIMARY_MINT_800: '#008B64',
  PRIMARY_MINT_900: '#007753',
  SECONDARY_SLATE: '#2D3E50',
  ACCENT_ORANGE: '#FF8C42',
  ALERT_CORAL: '#FF5E5B',
  BACKGROUND_SMOKE: '#F4F7F6',
  TEXT_PRIMARY: '#2D3E50',
  TEXT_SECONDARY: '#627582',
  TEXT_TERTIARY: '#8896A0',
  BORDER_LIGHT: '#E8ECEF',
  BORDER_MEDIUM: '#D1D9DD',
  BG_SUCCESS_LIGHT: '#E6F9F4',
  BG_WARNING_LIGHT: '#FFF3EC',
  BG_ERROR_LIGHT: '#FFEFEE',
  WHITE: '#FFFFFF',
} as const;

/**
 * Semantic color priorities for handling multiple colors
 * Higher number = higher priority
 */
export const COLOR_PRIORITY = {
  PRIMARY_MINT: 3,      // Primary actions (highest priority)
  ALERT_CORAL: 2,       // Critical alerts
  ACCENT_ORANGE: 1,     // Warnings/secondary actions (lowest priority)
} as const;

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculate relative luminance of a color
 * Based on WCAG 2.1 specification
 */
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const { r, g, b } = rgb;
  const [rs, gs, bs] = [r, g, b].map((val) => {
    const v = val / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * Returns ratio from 1 (no contrast) to 21 (maximum contrast)
 * WCAG 2.1 AA requires:
 * - 4.5:1 for normal text
 * - 3:1 for large text (18pt+ or 14pt+ bold)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG 2.1 AA standards
 * @param textColor - Text color in hex format
 * @param backgroundColor - Background color in hex format
 * @param isLargeText - Whether text is large (18pt+ or 14pt+ bold)
 * @returns true if contrast meets WCAG 2.1 AA standards
 */
export function meetsWCAGAA(
  textColor: string,
  backgroundColor: string,
  isLargeText = false
): boolean {
  const ratio = getContrastRatio(textColor, backgroundColor);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Get the most critical semantic color from a list
 * Used when an element requires multiple semantic colors
 * @param colors - Array of semantic color keys
 * @returns The color key with highest priority
 */
export function getPriorityColor(
  colors: Array<keyof typeof COLOR_PRIORITY>
): keyof typeof COLOR_PRIORITY {
  return colors.reduce((prev, curr) =>
    COLOR_PRIORITY[curr] > COLOR_PRIORITY[prev] ? curr : prev
  );
}

/**
 * Validate that a color combination meets accessibility standards
 * @param textColor - Text color in hex format
 * @param backgroundColor - Background color in hex format
 * @param isLargeText - Whether text is large
 * @returns Object with validation result and contrast ratio
 */
export function validateColorContrast(
  textColor: string,
  backgroundColor: string,
  isLargeText = false
): {
  valid: boolean;
  ratio: number;
  meetsAA: boolean;
  requiredRatio: number;
} {
  const ratio = getContrastRatio(textColor, backgroundColor);
  const requiredRatio = isLargeText ? 3 : 4.5;
  const meetsAA = ratio >= requiredRatio;

  return {
    valid: meetsAA,
    ratio: Math.round(ratio * 100) / 100,
    meetsAA,
    requiredRatio,
  };
}

/**
 * Get semantic background color for a badge or similar element
 * @param semanticColor - The semantic color (primary-mint, accent-orange, alert-coral)
 * @returns The corresponding light background color
 */
export function getSemanticBackground(
  semanticColor: 'primary-mint' | 'accent-orange' | 'alert-coral'
): string {
  const map = {
    'primary-mint': COLOR_VALUES.BG_SUCCESS_LIGHT,
    'accent-orange': COLOR_VALUES.BG_WARNING_LIGHT,
    'alert-coral': COLOR_VALUES.BG_ERROR_LIGHT,
  };
  return map[semanticColor];
}

/**
 * Get semantic text color for a badge or similar element
 * @param semanticColor - The semantic color (primary-mint, accent-orange, alert-coral)
 * @returns The corresponding text color
 */
export function getSemanticTextColor(
  semanticColor: 'primary-mint' | 'accent-orange' | 'alert-coral'
): string {
  const map = {
    'primary-mint': COLOR_VALUES.PRIMARY_MINT,
    'accent-orange': COLOR_VALUES.ACCENT_ORANGE,
    'alert-coral': COLOR_VALUES.ALERT_CORAL,
  };
  return map[semanticColor];
}


