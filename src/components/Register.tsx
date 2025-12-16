import { useState } from 'react';
import { Mail, Lock, User as UserIcon, ShoppingBag } from 'lucide-react';
import { Input } from './Input';
import { Button } from './Button';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormData } from '../validators/forms';

interface RegisterProps {
  onRegister: () => void;
  onSwitchToLogin: () => void;
}

export function Register({ onRegister, onSwitchToLogin }: RegisterProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const auth = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    try {
      await auth.signup(data.name, data.email, data.password, data.confirmPassword);
      onRegister();
    } catch (err: any) {
      setServerError(err?.response?.data?.message || 'Error al crear la cuenta');
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-6 py-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col"
      >
        {/* Logo & Branding */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-secondary-gold to-secondary-gold/60 rounded-[16px] flex items-center justify-center mb-3">
            <ShoppingBag className="w-8 h-8 text-primary-black" />
          </div>
          <h2 className="text-secondary-gold mb-1">Crear cuenta</h2>
          <p className="text-gray-400 text-sm text-center">
            Únete a MercApp y lleva control <br />de tus compras
          </p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Nombre completo"
            type="text"
            placeholder="Juan Pérez"
            icon={UserIcon}
            error={errors.name?.message}
            {...register('name')}
          />
          
          <Input
            label="Correo electrónico"
            type="email"
            placeholder="tu@email.com"
            icon={Mail}
            error={errors.email?.message}
            {...register('email')}
          />
          
          <Input
            label="Contraseña"
            type="password"
            placeholder="Mínimo 8 caracteres, una mayúscula, un número y un carácter especial"
            icon={Lock}
            error={errors.password?.message}
            {...register('password')}
          />
          
          <Input
            label="Confirmar contraseña"
            type="password"
            placeholder="Repite tu contraseña"
            icon={Lock}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Button type="submit" variant="primary" fullWidth disabled={isSubmitting}>
            {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
          </Button>
          {serverError && <div className="text-red-500 mt-2" role="alert">{serverError}</div>}
        </form>

        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-gray-400 mb-2">¿Ya tienes cuenta?</p>
          <Button variant="ghost" onClick={onSwitchToLogin} fullWidth>
            Iniciar sesión
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
