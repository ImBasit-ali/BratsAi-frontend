import { motion } from 'framer-motion';
import { TUMOR_REGIONS } from '../../utils/constants';

const TumorLegend = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl p-8 shadow-md border border-gray-100"
    >
      <h3 className="text-xl font-bold text-primary mb-6">Tumor Subregions</h3>
      <div className="space-y-4">
        {Object.entries(TUMOR_REGIONS).map(([key, region]) => (
          <div
            key={key}
            className="flex items-start gap-4 p-4 rounded-xl hover:bg-surface transition-colors"
          >
            <div
              className="w-6 h-6 rounded-lg flex-shrink-0 mt-0.5 shadow-inner"
              style={{ backgroundColor: region.color }}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-primary text-sm">{key}</span>
                <span className="text-textColor text-sm">{region.label}</span>
              </div>
              <p className="text-textColor/70 text-xs mt-1">{region.description}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default TumorLegend;
