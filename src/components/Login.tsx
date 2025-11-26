import { useState } from 'react';
import { Mail, Lock, ShoppingBag } from 'lucide-react';
import { Input } from './Input';
import { Button } from './Button';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';

interface LoginProps {
  onLogin?: () => void;
  onSwitchToRegister?: () => void;
}

export function Login({ onLogin, onSwitchToRegister }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const auth = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await auth.login(email, password);
      if (onLogin) onLogin();
      else {
        // App manages navigation via onLogin callback; if not provided, remain on current screen.
        console.warn('Login successful but no onLogin callback provided to navigate.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Credenciales incorrectas');
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-6 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col justify-center"
      >
        {/* Logo & Branding */}
        <div className="flex flex-col items-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-secondary-gold to-secondary-gold/60 rounded-[20px] flex items-center justify-center mb-4">
            <ShoppingBag className="w-10 h-10 text-primary-black" />
          </div>
          <h1 className="text-secondary-gold mb-2">MercApp</h1>
          <p className="text-gray-400 text-center">
            Tu asistente premium para <br />compras inteligentes
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
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
            placeholder="••••••••"
            icon={Lock}
            required
          />

          <Button type="submit" variant="primary" fullWidth>
            Iniciar sesión
          </Button>
          {error && <div className="text-red-500 mt-2" role="alert">{error}</div>}
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-gray-800" />
          <span className="text-gray-600">o</span>
          <div className="flex-1 h-px bg-gray-800" />
        </div>

        {/* Register Link */}
        <div className="text-center">
          <p className="text-gray-400 mb-2">¿No tienes cuenta?</p>
          <Button variant="secondary" onClick={onSwitchToRegister} fullWidth>
            Crear cuenta
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
