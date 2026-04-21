import { motion } from 'framer-motion';
import Card from '../ui/Card';

const steps = [
  {
    step: '01',
    title: 'Upload MRI Scans',
    description: 'Drag and drop your NIfTI (.nii) files with T1n, T1c, T2w, and T2f modalities.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
    color: 'from-teal to-teal-600',
  },
  {
    step: '02',
    title: 'AI Processes Scan',
    description: 'Our U-Net model preprocesses, runs inference, and post-processes your MRI data automatically.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    color: 'from-primary to-primary-400',
  },
  {
    step: '03',
    title: 'View Results',
    description: 'Explore segmented regions in an interactive 3D viewer with detailed clinical metrics.',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    color: 'from-orange to-orange-600',
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 bg-surface" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-teal font-semibold text-sm uppercase tracking-widest">Process</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-primary mt-3 mb-4">
            How It Works
          </h2>
          <p className="text-textColor max-w-xl mx-auto">
            Three simple steps to get AI-powered brain tumor segmentation results
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
            >
              <Card className="text-center h-full relative overflow-hidden group">
                {/* Step number background */}
                <div className="absolute -top-4 -right-4 text-8xl font-black text-primary/5 group-hover:text-teal/10 transition-colors duration-500">
                  {step.step}
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} text-white flex items-center justify-center mx-auto mb-5 shadow-lg`}>
                  {step.icon}
                </div>

                <h3 className="text-xl font-bold text-primary mb-3">{step.title}</h3>
                <p className="text-textColor text-sm leading-relaxed">{step.description}</p>

                {/* Connector line (hidden on last) */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary/20 to-transparent" />
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
