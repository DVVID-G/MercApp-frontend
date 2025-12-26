/**
 * Device Detection Utility
 * 
 * Functions for detecting device capabilities and determining performance tier
 * Feature: 001-barcode-scanner-mobile
 */

import type { DeviceCapabilities, PerformanceTier, Platform, Browser } from '../types/scanner.types';

/**
 * Detect comprehensive device capabilities including hardware and API support
 * @returns DeviceCapabilities object with all detected information
 */
export async function detectDeviceCapabilities(): Promise<DeviceCapabilities> {
  // Detect platform and browser
  const platform = detectPlatform();
  const browser = detectBrowser();
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // Detect hardware capabilities
  const cpuCores = navigator.hardwareConcurrency || 4;
  const memoryGB = (navigator as any).deviceMemory || 4;

  // Detect camera capabilities
  const cameraInfo = await detectCameraCapabilities();

  // Detect API support
  const supportsGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  const supportsVibration = !!navigator.vibrate;
  const supportsPermissionsAPI = !!navigator.permissions;

  // Determine performance tier
  const performanceTier = calculatePerformanceTier(cpuCores, memoryGB, isMobile);

  return {
    // Hardware
    hasCamera: cameraInfo.hasCamera,
    cameraCount: cameraInfo.cameraCount,
    hasBackCamera: cameraInfo.hasBackCamera,
    hasFrontCamera: cameraInfo.hasFrontCamera,

    // APIs
    supportsGetUserMedia,
    supportsVibration,
    supportsPermissionsAPI,

    // Performance
    cpuCores,
    memoryGB,
    performanceTier,

    // Platform
    platform,
    browser,
    isMobile
  };
}

/**
 * Detect camera capabilities (count, back/front availability)
 */
async function detectCameraCapabilities(): Promise<{
  hasCamera: boolean;
  cameraCount: number;
  hasBackCamera: boolean;
  hasFrontCamera: boolean;
}> {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return {
        hasCamera: false,
        cameraCount: 0,
        hasBackCamera: false,
        hasFrontCamera: false
      };
    }

    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    
    const hasBackCamera = videoDevices.some(device => 
      device.label.toLowerCase().includes('back') ||
      device.label.toLowerCase().includes('trasera') ||
      device.label.toLowerCase().includes('environment') ||
      device.label.toLowerCase().includes('rear')
    );

    const hasFrontCamera = videoDevices.some(device =>
      device.label.toLowerCase().includes('front') ||
      device.label.toLowerCase().includes('frontal') ||
      device.label.toLowerCase().includes('user') ||
      device.label.toLowerCase().includes('face')
    );

    return {
      hasCamera: videoDevices.length > 0,
      cameraCount: videoDevices.length,
      hasBackCamera,
      hasFrontCamera: hasFrontCamera || videoDevices.length > 0 // Assume at least one is front if not labeled
    };
  } catch (error) {
    // If enumeration fails, assume basic camera support
    return {
      hasCamera: true, // Optimistic fallback
      cameraCount: 1,
      hasBackCamera: true,
      hasFrontCamera: false
    };
  }
}

/**
 * Calculate performance tier based on CPU, memory, and platform
 * @param cpuCores - Number of CPU cores
 * @param memoryGB - RAM in gigabytes
 * @param isMobile - Whether device is mobile
 * @returns Performance tier (low/medium/high)
 */
function calculatePerformanceTier(
  cpuCores: number,
  memoryGB: number,
  isMobile: boolean
): PerformanceTier {
  // Base tier calculation
  let tier: PerformanceTier;

  if (cpuCores <= 4 && memoryGB <= 2) {
    tier = 'low';
  } else if (cpuCores <= 6 && memoryGB <= 4) {
    tier = 'medium';
  } else {
    tier = 'high';
  }

  // Mobile devices get downgraded one tier (mobile has lower performance than desktop with same specs)
  if (isMobile) {
    if (tier === 'high') tier = 'medium';
    else if (tier === 'medium' && cpuCores <= 4) tier = 'low';
  }

  return tier;
}

/**
 * Detect platform (iOS, Android, Desktop, Unknown)
 * @returns Platform identifier
 */
export function detectPlatform(): Platform {
  const userAgent = navigator.userAgent;

  if (/iPhone|iPad|iPod/i.test(userAgent)) {
    return 'ios';
  } else if (/Android/i.test(userAgent)) {
    return 'android';
  } else if (/Windows|Mac|Linux/i.test(userAgent)) {
    return 'desktop';
  }

  return 'unknown';
}

/**
 * Detect browser (Safari, Chrome, Firefox, Edge, Other)
 * @returns Browser identifier
 */
export function detectBrowser(): Browser {
  const userAgent = navigator.userAgent;

  // Check for specific browsers
  if (/Edg\//i.test(userAgent)) {
    return 'edge';
  } else if (/Chrome/i.test(userAgent) && !/Edg/i.test(userAgent)) {
    return 'chrome';
  } else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) {
    return 'safari';
  } else if (/Firefox/i.test(userAgent)) {
    return 'firefox';
  }

  return 'other';
}

/**
 * Check if device is mobile
 * Simple helper function
 * @returns true if mobile device
 */
export function isMobileDevice(): boolean {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/**
 * Get human-readable device info summary
 * Useful for debugging and logging
 * @param capabilities - Device capabilities object
 * @returns Human-readable string
 */
export function getDeviceInfoSummary(capabilities: DeviceCapabilities): string {
  return `${capabilities.platform} ${capabilities.browser} | ` +
    `${capabilities.cpuCores} cores, ${capabilities.memoryGB}GB | ` +
    `Tier: ${capabilities.performanceTier} | ` +
    `Cameras: ${capabilities.cameraCount} (back: ${capabilities.hasBackCamera}, front: ${capabilities.hasFrontCamera})`;
}

