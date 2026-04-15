import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { inferModalityFromFilename } from '../../utils/constants';

const FileUpload = ({ onFilesAdded }) => {
  const onDrop = useCallback(
    (acceptedFiles) => {
      const newFiles = acceptedFiles.map((file) => ({
        id: `${file.name}-${Date.now()}`,
        file,
        name: file.name,
        size: file.size,
        modality: inferModalityFromFilename(file.name),
      }));
      onFilesAdded(newFiles);
    },
    [onFilesAdded]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/gzip': ['.nii.gz', '.gz'],
      'application/octet-stream': ['.nii'],
      'image/png': ['.png'],
    },
    multiple: true,
  });

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      {...getRootProps()}
      className={`
        relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
        transition-all duration-300 ease-out
        ${isDragActive
          ? 'border-teal bg-teal/5 shadow-lg shadow-teal/10'
          : 'border-primary/15 hover:border-teal/40 hover:bg-surface'
        }
      `}
    >
      <input {...getInputProps()} />

      <AnimatePresence mode="wait">
        {isDragActive ? (
          <motion.div
            key="active"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="py-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-teal/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-teal animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
            <p className="text-teal font-semibold">Drop files here...</p>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-primary font-semibold mb-1">Upload MRI Inputs</p>
            <p className="text-textColor text-sm">
              Drag & drop <span className="font-medium text-primary">.nii</span> or{' '}
              <span className="font-medium text-primary">.nii.gz</span> files here, or click to browse
            </p>
            <p className="text-textColor/50 text-xs mt-2">
              Upload 1 file to duplicate into a 4-channel stack, or upload all 4 modalities once each
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FileUpload;
