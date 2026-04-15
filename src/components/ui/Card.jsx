import { motion } from 'framer-motion';

const Card = ({
  children,
  className = '',
  hover = true,
  glass = false,
  padding = 'p-6',
  onClick,
  ...props
}) => {
  return (
    <motion.div
      whileHover={hover ? { y: -4, boxShadow: '0 20px 40px rgba(26, 60, 94, 0.12)' } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
      className={`
        rounded-2xl
        ${glass ? 'glass' : 'bg-white'}
        shadow-md shadow-primary/5
        border border-white/60
        ${padding}
        transition-all duration-300
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
