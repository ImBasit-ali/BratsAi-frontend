import { motion } from 'framer-motion';
import PageTransition from '../components/layout/PageTransition';
import ArchitectureDiagram from '../components/model/ArchitectureDiagram';
import TumorLegend from '../components/model/TumorLegend';
import MetricsExplainer from '../components/model/MetricsExplainer';
import Card from '../components/ui/Card';

const ModelPage = () => {
  return (
    <PageTransition>
      <div className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="text-teal font-semibold text-sm uppercase tracking-widest">Technical Details</span>
            <h1 className="text-4xl sm:text-5xl font-bold text-primary mt-3 mb-6">
              Model Architecture &
              <br />
              <span className="text-gradient">Methodology</span>
            </h1>
            <p className="text-textColor">
              Deep dive into our U-Net architecture, training data, tumor subregions, and evaluation metrics
            </p>
          </motion.div>

          {/* U-Net Section */}
          <section className="mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-8 text-center flex flex-col items-center"
            >
              <h2 className="text-2xl font-bold text-primary mb-4">3D U-Net Architecture</h2>
              <p className="text-textColor max-w-3xl leading-relaxed mx-auto">
                Our model is based on the U-Net architecture, a convolutional neural network
                originally designed for biomedical image segmentation. The encoder-decoder
                structure with skip connections enables precise localization while maintaining
                context from higher-level features. We use a modified 3D version that processes
                volumetric MRI data directly, preserving spatial relationships across all three dimensions.
              </p>
            </motion.div>
            <ArchitectureDiagram />
          </section>

          {/* Dataset Section */}
          <section className="mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold text-primary mb-4">BraTS Dataset</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <h3 className="text-lg font-bold text-primary mb-3">Training Data</h3>
                  <p className="text-textColor text-sm leading-relaxed mb-4">
                    The Brain Tumor Segmentation (BraTS) Challenge provides a large-scale dataset
                    of multi-institutional, multi-modal MRI scans with expert voxel-level annotations.
                    The 2024 edition includes post-treatment cases with annotations for four distinct
                    tumor subregions.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Training Cases', value: '1,251' },
                      { label: 'Validation Cases', value: '219' },
                      { label: 'MRI Modalities', value: '4' },
                      { label: 'Tumor Classes', value: '4' },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-surface rounded-xl p-3 text-center">
                        <div className="text-xl font-bold text-teal">{stat.value}</div>
                        <div className="text-xs text-textColor/60 mt-1">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </Card>
 {
                <Card>
                  <h3 className="text-lg font-bold text-primary mb-3">Input Modalities</h3>
                  <p className="text-textColor text-sm leading-relaxed mb-4">
                    Each scan consists of four MRI modalities, providing complementary tissue contrast
                    information that is critical for accurate segmentation.
                  </p>
                  <div className="space-y-3">
                    {[
                      { mod: 'T1n', desc: 'Anatomical structure baseline' },
                      { mod: 'T1c', desc: 'Contrast-enhanced for active tumor' },
                      { mod: 'T2w', desc: 'Highlights edema and fluid' },
                      { mod: 'T2f', desc: 'Suppresses CSF for edema detection' },
                    ].map((item) => (
                      <div key={item.mod} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface transition-colors">
                        <div className="w-2 h-2 rounded-full bg-teal" />
                        <div>
                          <span className="text-sm font-semibold text-primary">{item.mod}</span>
                          <span className="text-xs text-textColor/60 ml-2">{item.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card> 
                }
              </div>
            </motion.div>
          </section>

          {/* Two-column: Tumor Legend + Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <TumorLegend />
            <MetricsExplainer />
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ModelPage;
