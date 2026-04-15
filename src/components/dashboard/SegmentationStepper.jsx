import { motion } from 'framer-motion';
import { PROCESSING_STEPS } from '../../utils/constants';

const SegmentationStepper = ({ currentStep, status }) => {
  const getStepIndex = () => {
    if (!currentStep) return -1;
    return PROCESSING_STEPS.findIndex((s) => s.key === currentStep);
  };

  const activeIndex = getStepIndex();

  return (
    <div className="space-y-3">
      {PROCESSING_STEPS.map((step, index) => {
        const isActive = index === activeIndex;
        const isComplete = index < activeIndex || status === 'done';
        const isPending = index > activeIndex;

        return (
          <motion.div
            key={step.key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`
              flex items-center gap-3 p-3 rounded-xl transition-all duration-300
              ${isActive ? 'bg-teal/10 shadow-sm' : ''}
              ${isComplete ? 'opacity-90' : ''}
              ${isPending ? 'opacity-40' : ''}
            `}
          >
            {/* Step indicator */}
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300
                ${isComplete ? 'bg-teal text-white' : ''}
                ${isActive ? 'bg-teal/20 text-teal step-active' : ''}
                ${isPending ? 'bg-primary/5 text-primary/30' : ''}
              `}
            >
              {isComplete ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="text-xs font-bold">{index + 1}</span>
              )}
            </div>

            {/* Step label */}
            <div className="flex-1">
              <p className={`text-sm font-medium ${isActive ? 'text-teal' : isComplete ? 'text-primary' : 'text-primary/40'}`}>
                {step.label}
              </p>
            </div>

            {/* Icon */}
            <span className="text-lg">{step.icon}</span>

            {/* Loading spinner for active step */}
            {isActive && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              >
                <svg className="w-4 h-4 text-teal" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </motion.div>
            )}
          </motion.div>
        );
      })}

      {/* Progress bar */}
      <div className="h-1.5 bg-primary/5 rounded-full overflow-hidden mt-2">
        <motion.div
          className="h-full bg-gradient-to-r from-teal to-teal-400 rounded-full"
          initial={{ width: '0%' }}
          animate={{
            width: status === 'done' ? '100%' : `${((activeIndex + 1) / PROCESSING_STEPS.length) * 100}%`,
          }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

export default SegmentationStepper;
