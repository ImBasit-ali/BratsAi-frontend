const colorMap = {
  teal: 'bg-teal/10 text-teal border-teal/20',
  orange: 'bg-orange/10 text-orange border-orange/20',
  blue: 'bg-primary/10 text-primary border-primary/20',
  green: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  red: 'bg-red-50 text-red-600 border-red-200',
  yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
  gray: 'bg-gray-100 text-gray-600 border-gray-200',
};

const Badge = ({ children, color = 'teal', className = '' }) => {
  return (
    <span
      className={`
        inline-flex items-center px-3 py-1
        text-xs font-semibold rounded-full
        border
        ${colorMap[color] || colorMap.teal}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

export default Badge;
