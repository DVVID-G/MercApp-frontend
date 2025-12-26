/**
 * PermissionPrompt Component
 * 
 * UI for camera permission request, denial, and recovery instructions
 * Feature: 001-barcode-scanner-mobile
 */

import React from 'react';
import type { PermissionState } from '../../types/scanner.types';
import { Card } from '../Card';
import { Button } from '../Button';

interface PermissionPromptProps {
  permissionState: PermissionState;
  onRequestPermission: () => void;
}

export function PermissionPrompt({ permissionState, onRequestPermission }: PermissionPromptProps) {
  const { status, instructions } = permissionState;

  // Requesting state
  if (status === 'requesting') {
    return (
      <Card className="bg-gray-900/50 border-gray-800 p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-white text-center">Solicitando permiso de cámara...</p>
        </div>
      </Card>
    );
  }

  // Blocked state with instructions
  if (status === 'blocked' && instructions) {
    return (
      <div className="space-y-4">
        <Card className="bg-red-900/20 border-red-500 p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg">Permisos Bloqueados</h3>
                <p className="text-gray-400 text-sm">Los permisos de cámara están bloqueados</p>
              </div>
            </div>

            <div className="bg-gray-950/50 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">{instructions.title}</h4>
              <ol className="space-y-2">
                {instructions.steps.map((step, index) => (
                  <li key={index} className="flex gap-3 text-gray-300 text-sm">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-xs font-semibold">
                      {index + 1}
                    </span>
                    <span className="flex-1 pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Denied state
  if (status === 'denied') {
    return (
      <Card className="bg-yellow-900/20 border-yellow-600 p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold">Permiso Denegado</h3>
              <p className="text-gray-400 text-sm">Necesitamos acceso a tu cámara</p>
            </div>
          </div>

          <p className="text-gray-300 text-sm">
            Para escanear códigos de barras, necesitamos acceso a tu cámara. 
            Por favor, permite el acceso cuando el navegador lo solicite.
          </p>

          <Button
            onClick={onRequestPermission}
            variant="primary"
            fullWidth
            className="min-h-[44px]"
          >
            Intentar Nuevamente
          </Button>
        </div>
      </Card>
    );
  }

  // Not requested state (initial)
  return (
    <Card className="bg-gray-900/50 border-gray-800 p-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold">Acceso a Cámara</h3>
            <p className="text-gray-400 text-sm">Necesario para escanear códigos</p>
          </div>
        </div>

        <p className="text-gray-300 text-sm">
          Para escanear códigos de barras de productos, necesitamos acceso a la cámara de tu dispositivo.
          Tus imágenes no se almacenan ni comparten.
        </p>

        <Button
          onClick={onRequestPermission}
          variant="primary"
          fullWidth
          className="min-h-[44px]"
        >
          Permitir Acceso a Cámara
        </Button>

        <p className="text-gray-500 text-xs text-center">
          El navegador te pedirá confirmación
        </p>
      </div>
    </Card>
  );
}

