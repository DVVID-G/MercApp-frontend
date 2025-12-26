/**
 * ScannerInstructions Component
 * 
 * Display scanning instructions and supported formats
 * Feature: 001-barcode-scanner-mobile
 */

import React from 'react';
import { Card } from '../Card';

export function ScannerInstructions() {
  return (
    <Card className="bg-gray-900/50 border-gray-800 w-full max-w-sm">
      <h4 className="text-white mb-3 text-sm font-medium">Instrucciones</h4>
      <ul className="space-y-2 text-gray-400 text-xs">
        <li className="flex items-start gap-2">
          <span className="text-blue-400 mt-0.5">•</span>
          <span>Mantén el código dentro del recuadro</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-blue-400 mt-0.5">•</span>
          <span>Asegura buena iluminación</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-blue-400 mt-0.5">•</span>
          <span>Soporta EAN-13, UPC, Code-128</span>
        </li>
      </ul>
    </Card>
  );
}

