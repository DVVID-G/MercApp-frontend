import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Eye, EyeOff, Save, Lock } from 'lucide-react';
import { UpdateAccountInput } from '../services/user-account.service';

const updateAccountSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').optional(),
  email: z.string().email('Email inválido').optional(),
}).refine((data) => (data.name?.trim() ?? '') !== '' || (data.email?.trim() ?? '') !== '', {
  message: 'Debe proporcionar al menos un campo para actualizar',
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es obligatoria'),
  newPassword: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número')
    .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un carácter especial'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'La nueva contraseña debe ser diferente de la actual',
  path: ['newPassword'],
});

type UpdateAccountFormData = z.infer<typeof updateAccountSchema>;
type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export function AccountSettings() {
  const { user } = useAuth();
  const { updateAccount, changePassword, updatingAccount, changingPassword } = useSettings();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register: registerAccount,
    handleSubmit: handleSubmitAccount,
    formState: { errors: accountErrors },
    reset: resetAccount,
  } = useForm<UpdateAccountFormData>({
    resolver: zodResolver(updateAccountSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onAccountSubmit = async (data: UpdateAccountFormData) => {
    try {
      const updates: UpdateAccountInput = {};
      if (data.name && data.name.trim() !== user?.name) {
        updates.name = data.name.trim();
      }
      if (data.email && data.email.trim() !== user?.email) {
        updates.email = data.email.trim();
      }
      
      if (Object.keys(updates).length > 0) {
        await updateAccount(updates);
        resetAccount();
      }
    } catch (error) {
      // Error handling is done in SettingsContext
    }
  };

  const onPasswordSubmit = async (data: ChangePasswordFormData) => {
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      resetPassword();
    } catch (error) {
      // Error handling is done in SettingsContext
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Update Account Info */}
      <Card className="p-4">
        <h3 className="mb-4">Información de Cuenta</h3>
        <form onSubmit={handleSubmitAccount(onAccountSubmit)} className="space-y-4">
          <Input
            label="Nombre"
            {...registerAccount('name')}
            placeholder="Tu nombre"
            error={accountErrors.name?.message}
          />

          <Input
            label="Email"
            type="email"
            {...registerAccount('email')}
            placeholder="tu@email.com"
            error={accountErrors.email?.message}
          />

          <Button
            type="submit"
            variant="primary"
            disabled={updatingAccount}
            fullWidth
          >
            <Save className="w-4 h-4" />
            Guardar cambios
          </Button>
        </form>
      </Card>

      {/* Change Password */}
      <Card className="p-4">
        <h3 className="mb-4">Cambiar Contraseña</h3>
        <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-4">
          <div className="relative">
            <Input
              label="Contraseña actual"
              type={showCurrentPassword ? 'text' : 'password'}
              {...registerPassword('currentPassword')}
              placeholder="Contraseña actual"
              error={passwordErrors.currentPassword?.message}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-[42px] text-gray-400 hover:text-white"
            >
              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="relative">
            <Input
              label="Nueva contraseña"
              type={showNewPassword ? 'text' : 'password'}
              {...registerPassword('newPassword')}
              placeholder="Nueva contraseña"
              error={passwordErrors.newPassword?.message}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-[42px] text-gray-400 hover:text-white"
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <p className="text-xs text-gray-500 mt-1">
              Mínimo 8 caracteres, una mayúscula, un número y un carácter especial
            </p>
          </div>

          <div className="relative">
            <Input
              label="Confirmar nueva contraseña"
              type={showConfirmPassword ? 'text' : 'password'}
              {...registerPassword('confirmPassword')}
              placeholder="Confirmar nueva contraseña"
              error={passwordErrors.confirmPassword?.message}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-[42px] text-gray-400 hover:text-white"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={changingPassword}
            fullWidth
          >
            <Lock className="w-4 h-4" />
            Cambiar contraseña
          </Button>
        </form>
      </Card>
    </motion.div>
  );
}

