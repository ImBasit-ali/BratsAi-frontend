import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-gradient-to-r from-primary to-teal text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30',
  secondary: 'bg-white text-primary border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5',
  teal: 'bg-gradient-to-r from-teal to-teal-600 text-white shadow-lg shadow-teal/25 hover:shadow-xl hover:shadow-teal/30',
  orange: 'bg-gradient-to-r from-orange to-orange-600 text-white shadow-lg shadow-orange/25 hover:shadow-xl hover:shadow-orange/30',
  ghost: 'bg-transparent text-primary hover:bg-primary/5',
  danger: 'bg-red-500 text-white hover:bg-red-600',
};

const sizes = {
  xs: 'px-3 py-1.5 text-xs',
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  icon,
  ...props
}) => {
  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.02, y: -1 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2
        font-semibold rounded-xl
        transition-all duration-300 ease-out
        focus:outline-none focus:ring-2 focus:ring-teal/50 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {icon && !loading && <span className="text-lg">{icon}</span>}
      {children}
    </motion.button>
  );
};

export default Button;
