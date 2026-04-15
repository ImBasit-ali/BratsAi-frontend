import { motion } from 'framer-motion';
import Card from '../ui/Card';

const metrics = [
  {
    name: 'Dice Similarity Coefficient (DSC)',
    formula: 'DSC = 2|P ∩ G| / (|P| + |G|)',
    description: 'Measures the overlap between the predicted segmentation (P) and ground truth (G). A DSC of 1.0 indicates perfect overlap.',
    range: '0 to 1 (higher is better)',
    icon: '🎯',
  },
  {
    name: 'Sensitivity (Recall)',
    formula: 'Sens = TP / (TP + FN)',
    description: 'Measures the proportion of actual tumor voxels that are correctly identified. High sensitivity means fewer missed tumor regions.',
    range: '0 to 1 (higher is better)',
    icon: '📡',
  },
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
