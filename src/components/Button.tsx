import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: LucideIcon;
  fullWidth?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit';
  className?: string;
}

export function Button({ 
  children, 
  onClick, 
  variant = 'primary', 
  icon: Icon,
  fullWidth = false,
  disabled = false,
  type = 'button',
  className = ''
}: ButtonProps) {
  const baseStyles = "px-6 py-3 rounded-[12px] flex items-center justify-center gap-2 transition-all duration-200";
  
  const variants = {
    primary: "bg-primary-black border-2 border-secondary-gold text-white hover:bg-secondary-gold hover:text-primary-black",
    secondary: "bg-gray-950 border-2 border-gray-800 text-white hover:border-secondary-gold",
    ghost: "bg-transparent text-gray-400 hover:text-white"
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {Icon && <Icon className="w-5 h-5" />}
      <span>{children}</span>
    </motion.button>
  );
}
