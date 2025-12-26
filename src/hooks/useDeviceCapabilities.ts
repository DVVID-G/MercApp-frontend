/**
 * useDeviceCapabilities Hook
 * 
 * Detects device capabilities and returns adaptive QuaggaJS configuration
 * Feature: 001-barcode-scanner-mobile
 */

import { useState, useEffect } from 'react';
import type { DeviceCapabilities, PerformanceTier } from '../types/scanner.types';
import { detectDeviceCapabilities } from '../utils/device-detection';
import { generateQuaggaConfig } from '../utils/quagga-config';

export function useDeviceCapabilities() {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities | null>(null);
  const [tier, setTier] = useState<PerformanceTier>('medium');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const detectCapabilities = async () => {
      try {
        setIsLoading(true);
        const detected = await detectDeviceCapabilities();
        setCapabilities(detected);
        setTier(detected.performanceTier);
      } catch (error) {
        console.error('Failed to detect device capabilities:', error);
        // Fallback to medium tier
        setTier('medium');
      } finally {
        setIsLoading(false);
      }
    };

    detectCapabilities();
  }, []);

  // Generate QuaggaJS config based on detected tier
  const getQuaggaConfig = () => {
    return generateQuaggaConfig(tier);
  };

  return {
    capabilities,
    tier,
    isLoading,
    getQuaggaConfig
  };
}

