import { motion } from 'framer-motion';
import PageTransition from '../components/layout/PageTransition';
import TeamCard from '../components/about/TeamCard';
import { TEAM_MEMBERS } from '../utils/constants';

const AboutPage = () => {
  return (
    <PageTransition>
      <div className="pt-24 pb-20">
        {/* Header */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="text-teal font-semibold text-sm uppercase tracking-widest">About the Project</span>
            <h1 className="text-4xl sm:text-5xl font-bold text-primary mt-3 mb-6">
              Advancing Brain Tumor
              <br />
              <span className="text-gradient">Segmentation with AI</span>
            </h1>
          </motion.div>

          {/* Project Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="max-w-3xl mx-auto space-y-6 text-textColor leading-relaxed"
          >
            <p>
              Post-treatment brain tumor segmentation is a critical challenge in neuro-oncology.
              After surgical intervention, chemotherapy, or radiation therapy, the brain's anatomy
              undergoes significant changes, making it difficult to accurately delineate tumor
              boundaries from treatment-related effects.
            </p>
            <p>
              Our project leverages the power of deep learning, specifically a modified 3D U-Net
              architecture, to automatically segment post-treatment brain tumors from multi-modal
              MRI scans. By analyzing T1-weighted, T1-CE, T2-weighted, and FLAIR modalities
              together, our model can distinguish between different tumor subregions including
              enhancing tumor, non-enhancing tumor core, surrounding FLAIR hyperintensity, and
              resection cavity.
            </p>
            <p>
              Trained on the BraTS (Brain Tumor Segmentation) Challenge dataset with expert
              radiologist annotations, our model achieves state-of-the-art performance metrics.
              This platform provides an accessible interface for researchers and clinicians to
              upload MRI scans and obtain instant, reliable segmentation results with comprehensive
              clinical metrics.
            </p>
          </motion.div>
        </section>

        {/* Team Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="text-orange font-semibold text-sm uppercase tracking-widest">The Team</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mt-3 mb-4">
              Meet Our Researchers
            </h2>
            <p className="text-textColor max-w-xl mx-auto">
              A multidisciplinary team of experts in AI, medical imaging, and software engineering
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEAM_MEMBERS.map((member, index) => (
              <TeamCard key={member.name} member={member} index={index} />
            ))}
          </div>
        </section>
      </div>
    </PageTransition>
  );
};

export default AboutPage;
