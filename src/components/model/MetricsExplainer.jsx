import { motion } from 'framer-motion';
import Card from '../ui/Card';

const metrics = [

  {
    name: 'Specificity',
    formula: 'Spec = TN / (TN + FP)',
    description: 'Measures the proportion of non-tumor voxels correctly identified as non-tumor. High specificity means fewer false alarms.',
    range: '0 to 1 (higher is better)',
    icon: '🛡️',
  },
];

const MetricsExplainer = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <h3 className="text-xl font-bold text-primary mb-6">Performance Metrics</h3>
      <div className="space-y-4">
        {metrics.map((metric, index) => (
          <Card key={metric.name} className="group">
            <div className="flex items-start gap-4">
              <div className="text-3xl group-hover:scale-110 transition-transform">{metric.icon}</div>
              <div className="flex-1">
                <h4 className="font-bold text-primary text-base mb-1">{metric.name}</h4>
                <code className="text-xs bg-primary/5 text-primary px-3 py-1 rounded-lg font-mono inline-block mb-2">
                  {metric.formula}
                </code>
                <p className="text-textColor text-sm leading-relaxed">{metric.description}</p>
                <p className="text-teal text-xs font-medium mt-2">Range: {metric.range}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </motion.div>
  );
};

export default MetricsExplainer;
