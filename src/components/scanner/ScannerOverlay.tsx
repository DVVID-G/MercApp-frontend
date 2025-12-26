/**
 * ScannerOverlay Component
 * 
 * Visual overlay with guide frame and state-based feedback
 * Feature: 001-barcode-scanner-mobile
 */

import React, { useEffect } from 'react';
import type { ScannerVisualState } from '../../types/scanner.types';
import {
  getFrameColor,
  getFrameClasses,
  getFeedbackMessage,
  getFeedbackIcon,
  triggerVibration,
  isVibrationSupported
} from '../../utils/scanner-feedback';

interface ScannerOverlayProps {
  state: ScannerVisualState;
  vibrationEnabled?: boolean;
}

export function ScannerOverlay({ state, vibrationEnabled = true }: ScannerOverlayProps) {
  // Trigger vibration on state changes
  useEffect(() => {
    if (!vibrationEnabled || !isVibrationSupported()) {
      return;
    }

    if (state === 'success') {
      triggerVibration('success');
    } else if (state === 'error') {
      triggerVibration('error');
    } else if (state === 'detecting') {
      triggerVibration('detecting');
    }
  }, [state, vibrationEnabled]);

  const frameClasses = getFrameClasses(state);
  const message = getFeedbackMessage(state);
  const icon = getFeedbackIcon(state);

  return (
    <div className="relative w-full flex flex-col items-center gap-4">
      {/* Guide Frame - 250x250px centered */}
      <div
        data-testid="scanner-frame"
        className={`w-[250px] h-[250px] ${frameClasses}`}
        style={{
          borderColor: getFrameColor(state),
          boxShadow: `0 0 20px ${getFrameColor(state)}40`
        }}
      >
        {/* Crosshair guide */}
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="absolute w-full h-0.5 bg-white/20" />
          <div className="absolute w-0.5 h-full bg-white/20" />
        </div>
      </div>

      {/* Feedback Message with Icon */}
      <div className="flex items-center gap-3 px-4">
        {icon === 'search' && (
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        )}
        {icon === 'loader' && (
          <div className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        )}
        {icon === 'check' && (
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
        {icon === 'error' && (
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
        
        <p className="text-white text-sm font-medium">{message}</p>
      </div>

      {/* State indicator dot */}
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            state === 'idle' ? 'bg-blue-500 animate-pulse' :
            state === 'detecting' ? 'bg-yellow-500' :
            state === 'success' ? 'bg-green-500' :
            'bg-red-500'
          }`}
        />
        <span className="text-xs text-gray-500 uppercase tracking-wide">
          {state}
        </span>
      </div>
    </div>
  );
}

