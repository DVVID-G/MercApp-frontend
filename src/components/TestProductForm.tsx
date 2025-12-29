import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ProductForm } from './product/ProductForm';
import { motion } from 'motion/react';

interface TestProductFormProps {
  onBack: () => void;
}

/**
 * Componente de prueba para el nuevo formulario de productos Fruver
 * Úsalo temporalmente para probar la funcionalidad
 */
export function TestProductForm({ onBack }: TestProductFormProps) {
  return (
    <div className="min-h-screen bg-primary-black pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-gray-950 to-primary-black px-6 pt-12 pb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-800 rounded-[8px] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-white text-2xl font-bold">Crear Producto</h2>
              <small className="text-gray-400">Regular o Fruver (Peso Variable)</small>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Formulario */}
      <div className="px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-950 rounded-[16px] p-6 border border-gray-800"
        >
          <ProductForm
            onSuccess={() => {
              console.log('✅ Producto creado exitosamente');
              onBack();
            }}
            onCancel={onBack}
          />
        </motion.div>
      </div>
    </div>
  );
}


