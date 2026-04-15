import { motion } from 'framer-motion';
import Card from '../ui/Card';

const TeamCard = ({ member, index }) => {
  const initials = member.name.split(' ').map(n => n[0]).join('');
  const gradients = [
    'from-teal to-teal-600',
    'from-primary to-primary-400',
    'from-orange to-orange-600',
    'from-teal-600 to-primary',
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.6 }}
    >
      <Card className="text-center h-full group">
        {/* Avatar */}
        <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${gradients[index % gradients.length]} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-105 transition-transform duration-300`}>
          <span className="text-2xl font-bold text-white">{initials}</span>
        </div>

        <h3 className="text-lg font-bold text-primary mb-1">{member.name}</h3>
        <p className="text-teal font-medium text-sm mb-3">{member.role}</p>
        <p className="text-textColor text-sm leading-relaxed">{member.bio}</p>
      </Card>
    </motion.div>
  );
};

export default TeamCard;
