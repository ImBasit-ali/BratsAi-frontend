import { motion } from 'framer-motion';

const ArchitectureDiagram = () => {
  const encoderBlocks = [
    { label: 'Input', channels: '4ch', size: '240³', color: 'bg-teal/20 text-teal' },
    { label: 'Enc 1', channels: '32', size: '120³', color: 'bg-primary/20 text-primary' },
    { label: 'Enc 2', channels: '64', size: '60³', color: 'bg-primary/30 text-primary' },
    { label: 'Enc 3', channels: '128', size: '30³', color: 'bg-primary/40 text-primary' },
  ];

  const bottleneck = { label: 'Bottleneck', channels: '256', size: '15³', color: 'bg-orange/20 text-orange' };

  const decoderBlocks = [
    { label: 'Dec 3', channels: '128', size: '30³', color: 'bg-teal/40 text-teal-700' },
    { label: 'Dec 2', channels: '64', size: '60³', color: 'bg-teal/30 text-teal-600' },
    { label: 'Dec 1', channels: '32', size: '120³', color: 'bg-teal/20 text-teal' },
    { label: 'Output', channels: '4ch', size: '240³', color: 'bg-green-100 text-green-600' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl p-8 shadow-md border border-gray-100"
    >
      <h3 className="text-xl font-bold text-primary mb-6 text-center">3D U-Net Architecture</h3>

      <div className="flex flex-col items-center gap-2">
        {/* Encoder */}
        <div className="text-xs font-semibold text-primary/50 uppercase tracking-wide mb-1">Encoder Path</div>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {encoderBlocks.map((block, i) => (
            <div key={block.label} className="flex items-center gap-2">
              <div className={`${block.color} rounded-xl px-4 py-3 text-center min-w-[80px]`}>
                <div className="font-bold text-sm">{block.label}</div>
                <div className="text-xs opacity-70">{block.channels} • {block.size}</div>
              </div>
              {i < encoderBlocks.length - 1 && (
                <svg className="w-4 h-4 text-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          ))}
        </div>

        {/* Arrow down */}
        <svg className="w-5 h-5 text-primary/30 my-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>

        {/* Bottleneck */}
        <div className={`${bottleneck.color} rounded-xl px-6 py-3 text-center`}>
          <div className="font-bold text-sm">{bottleneck.label}</div>
          <div className="text-xs opacity-70">{bottleneck.channels} • {bottleneck.size}</div>
        </div>

        {/* Arrow down */}
        <svg className="w-5 h-5 text-primary/30 my-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>

        {/* Decoder */}
        <div className="text-xs font-semibold text-teal/50 uppercase tracking-wide mb-1">Decoder Path (+ Skip Connections)</div>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {decoderBlocks.map((block, i) => (
            <div key={block.label} className="flex items-center gap-2">
              <div className={`${block.color} rounded-xl px-4 py-3 text-center min-w-[80px]`}>
                <div className="font-bold text-sm">{block.label}</div>
                <div className="text-xs opacity-70">{block.channels} • {block.size}</div>
              </div>
              {i < decoderBlocks.length - 1 && (
                <svg className="w-4 h-4 text-teal/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-textColor text-sm mt-6">
        Skip connections bridge encoder features to corresponding decoder levels, preserving spatial information.
      </p>
    </motion.div>
  );
};

export default ArchitectureDiagram;
