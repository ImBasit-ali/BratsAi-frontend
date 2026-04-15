import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

const CTABanner = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 gradient-primary" />
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }} />

      {/* Decorative blurs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Analyze Your
            <br />
            <span className="text-teal-300">Brain MRI Scans?</span>
          </h2>
          <p className="text-lg text-white/60 mb-10 max-w-xl mx-auto">
            Upload your NIfTI files and get instant segmentation results with
            detailed metrics and interactive visualization.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/dashboard">
              <Button variant="teal" size="lg" icon="🚀">
                Start Segmentation
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="ghost" size="lg" className="!text-white/70 hover:!text-white hover:!bg-white/10 !border-white/20">
                Learn About the Project
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTABanner;
