import { useState } from 'react';
import { Mail, Lock, User as UserIcon, ShoppingBag } from 'lucide-react';
import { Input } from './Input';
import { Button } from './Button';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';

interface RegisterProps {
  onRegister: () => void;
  onSwitchToLogin: () => void;
}

export function Register({ onRegister, onSwitchToLogin }: RegisterProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const auth = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      await auth.signup(name, email, password, confirmPassword);
      onRegister();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al crear la cuenta');
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
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Nombre completo"
            type="text"
            value={name}
            onChange={setName}
            placeholder="Juan Pérez"
            icon={UserIcon}
            required
          />
          
          <Input
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="tu@email.com"
            icon={Mail}
            required
          />
          
          <Input
            label="Contraseña"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="Mínimo 6 caracteres"
            icon={Lock}
            required
          />
          
          <Input
            label="Confirmar contraseña"
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Repite tu contraseña"
            icon={Lock}
            error={error}
            required
          />

          <div className="pt-2">
            <Button type="submit" variant="primary" fullWidth>
              Crear cuenta
            </Button>
          </div>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-gray-800" />
          <span className="text-gray-600">o</span>
          <div className="flex-1 h-px bg-gray-800" />
        </div>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-gray-400 mb-2">¿Ya tienes cuenta?</p>
          <Button variant="ghost" onClick={onSwitchToLogin} fullWidth>
            Iniciar sesión
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
